const { getDB } = require('../config/db');
const { createAndEmitNotification } = require('../utils/createNotification');

const getAllAuctions = async (req, res) => {
  const db = getDB();
  try {
    const { status = 'active', search, sort = 'ending-soon', limit = 10, offset = 0 } = req.query;

    let query = 'SELECT a.*, art.title, art.thumbnail_image, u.name as artist_name FROM auctions a JOIN artworks art ON a.artwork_id = art.id JOIN users u ON art.user_id = u.id';
    const params = [];

    let whereClauses = [];
    if (status === 'active') {
      whereClauses.push('a.status = ? AND a.end_time > NOW()');
      params.push('active');
    } else if (status === 'upcoming') {
      whereClauses.push('a.status = ? AND a.start_time > NOW()');
      params.push('upcoming');
    } else if (status && status !== 'all') {
      whereClauses.push('a.status = ?');
      params.push(status);
    }

    if (search) {
      whereClauses.push('(art.title LIKE ? OR u.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const [totalResult] = await db.execute('SELECT COUNT(*) as count FROM (' + query.replace('SELECT a.*, art.title, art.thumbnail_image, u.name as artist_name', 'SELECT a.id') + ') as sub', params);
    const total = totalResult[0].count;

    switch (sort) {
      case 'newly-listed':
        query += ' ORDER BY a.created_at DESC';
        break;
      case 'most-bids':
        query += ' ORDER BY a.total_bids DESC';
        break;
      default: // ending-soon
        query += ' ORDER BY a.end_time ASC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [auctions] = await db.execute(query, params);

    res.json({
      auctions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Failed to fetch auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
};

const getAuctionById = async (req, res) => {
  const db = getDB();
  try {
    const [rows] = await db.execute(
      'SELECT a.*, art.title, art.description, art.original_image, u.name as artist_name FROM auctions a JOIN artworks art ON a.artwork_id = art.id JOIN users u ON art.user_id = u.id WHERE a.id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Failed to fetch auction:', error);
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
};

const createAuction = async (req, res) => {
  const db = getDB();
  try {
    const { artwork_id, starting_bid, end_time, reserve_price, start_time } = req.body;
    const userId = req.user.userId;

    const [artworkRows] = await db.execute('SELECT * FROM artworks WHERE id = ? AND user_id = ?', [artwork_id, userId]);
    if (artworkRows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to create an auction for this artwork' });
    }

    const status = start_time && new Date(start_time) > new Date() ? 'upcoming' : 'active';
    const finalStartTime = start_time || new Date();

    await db.execute(
      'INSERT INTO auctions (artwork_id, starting_bid, current_bid, reserve_price, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [artwork_id, starting_bid, starting_bid, reserve_price || null, finalStartTime, end_time, status]
    );

    res.status(201).json({ success: true, message: 'Auction created successfully' });
  } catch (error) {
    console.error('Failed to create auction:', error);
    res.status(500).json({ error: 'Failed to create auction', details: error.message });
  }
};

const placeBid = async (req, res) => {
  const db = getDB();
  try {
    const { id: auctionId } = req.params;
    const { amount } = req.body;
    const userId = req.user.userId;

    const [auctionRows] = await db.execute('SELECT * FROM auctions WHERE id = ?', [auctionId]);
    if (auctionRows.length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    const auction = auctionRows[0];
    const previousHighestBidderId = auction.winner_id; // Assuming winner_id holds the current highest bidder

    if (new Date(auction.end_time) < new Date()) {
      return res.status(400).json({ error: 'Auction has ended' });
    }

    if (amount <= auction.current_bid) {
      return res.status(400).json({ error: 'Bid must be higher than the current bid' });
    }

    await db.execute('INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)', [auctionId, userId, amount]);
    await db.execute('UPDATE auctions SET current_bid = ?, total_bids = total_bids + 1, winner_id = ? WHERE id = ?', [amount, userId, auctionId]);

    // --- NOTIFICATIONS ---
    const [artwork] = await db.execute('SELECT title, user_id FROM artworks WHERE id = ?', [auction.artwork_id]);
    const artworkTitle = artwork[0].title;
    const artistId = artwork[0].user_id;
    const [bidder] = await db.execute('SELECT name FROM users WHERE id = ?', [userId]);
    const bidderName = bidder[0].name;

    // 1. Notify the artist
    if (artistId !== userId) { // Don't notify artist if they are bidding on their own item (should not happen with role guards)
        await createAndEmitNotification(
            artistId,
            `${bidderName} placed a bid of ₱${amount} on your artwork: "${artworkTitle}"`,
            `/auctions/${auctionId}`
        );
    }

    // 2. Notify the outbid user
    if (previousHighestBidderId && previousHighestBidderId !== userId) {
        await createAndEmitNotification(
            previousHighestBidderId,
            `You have been outbid on the artwork: "${artworkTitle}". The new bid is ₱${amount}.`,
            `/auctions/${auctionId}`
        );
    }
    // --- END NOTIFICATIONS ---

    res.json({ success: true, message: 'Bid placed successfully' });
  } catch (error) {
    console.error('Failed to place bid:', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
};

const watchAuction = async (req, res) => {
  const db = getDB();
  try {
    const { id: auctionId } = req.params;
    const userId = req.user.userId;

    const [existingWatch] = await db.execute(
      'SELECT id FROM watchlists WHERE user_id = ? AND auction_id = ?',
      [userId, auctionId]
    );

    if (existingWatch.length > 0) {
      await db.execute('DELETE FROM watchlists WHERE id = ?', [existingWatch[0].id]);
      await db.execute('UPDATE auctions SET watchers = watchers - 1 WHERE id = ?', [auctionId]);
      res.json({ success: true, watching: false, message: 'Auction removed from watchlist' });
    } else {
      await db.execute('INSERT INTO watchlists (user_id, auction_id) VALUES (?, ?)', [userId, auctionId]);
      await db.execute('UPDATE auctions SET watchers = watchers + 1 WHERE id = ?', [auctionId]);
      res.json({ success: true, watching: true, message: 'Auction added to watchlist' });
    }
  } catch (error) {
    console.error('Failed to watch/unwatch auction:', error);
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
};

const getBiddingHistory = async (req, res) => {
  const db = getDB();
  try {
    const userId = req.user.userId;
    const [bids] = await db.execute(
      `SELECT
        b.amount,
        b.created_at,
        a.status as auction_status,
        art.title as artwork_title,
        art.id as artwork_id
      FROM bids b
      JOIN auctions a ON b.auction_id = a.id
      JOIN artworks art ON a.artwork_id = art.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(bids);
  } catch (error) {
    console.error('Failed to fetch bidding history:', error);
    res.status(500).json({ error: 'Failed to fetch bidding history' });
  }
};

const getWatchlistStatus = async (req, res) => {
  const db = getDB();
  try {
    const { id: auctionId } = req.params;
    const userId = req.user.userId;

    const [rows] = await db.execute(
      'SELECT id FROM watchlists WHERE user_id = ? AND auction_id = ?',
      [userId, auctionId]
    );

    res.json({ isWatching: rows.length > 0 });
  } catch (error) {
    console.error('Failed to fetch watchlist status:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist status' });
  }
};

module.exports = {
  getAllAuctions,
  getAuctionById,
  createAuction,
  placeBid,
  watchAuction,
  getBiddingHistory,
  getWatchlistStatus,
}; 