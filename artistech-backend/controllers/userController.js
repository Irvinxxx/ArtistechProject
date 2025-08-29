const { getDB } = require('../config/db');

const getArtistProfile = async (req, res) => {
  const db = getDB();
  try {
    const { id } = req.params;
    const [users] = await db.query('SELECT id, name, profile_image, bio, location, created_at, availability FROM users WHERE id = ? AND user_type = \'artist\'', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    const artist = users[0];

    // Fetch artworks for portfolio
    const [artworks] = await db.query('SELECT id, title, thumbnail_image, price, status, artwork_type FROM artworks WHERE user_id = ? AND is_portfolio_piece = 1 AND status = \'published\' ORDER BY created_at DESC', [id]);
    
    // Fetch artist skills
    const [skills] = await db.query(`
        SELECT s.id, s.name, s.type, ask.proficiency
        FROM artist_skills ask
        JOIN skills s ON ask.skill_id = s.id
        WHERE ask.user_id = ?
        ORDER BY s.type, s.name
    `, [id]);

    // Fetch reviews
    const [reviews] = await db.query(`
        SELECT r.id, r.rating, r.review_text, r.created_at, u.name as reviewer_name
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.reviewed_id = ?
        ORDER BY r.created_at DESC
    `, [id]);
    
    // Fetch commission listings
    const [commissionListings] = await db.query(
        'SELECT * FROM commission_listings WHERE artist_id = ? AND status = "active" ORDER BY created_at DESC',
        [id]
    );

    // Calculate average rating
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 'No reviews yet';

    // Get follower count
    const [followerCount] = await db.query('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [id]);
    const followersCount = followerCount[0].count;

    res.json({
      ...artist,
      portfolio: artworks,
      skills,
      reviews,
      averageRating,
      commissionListings,
      followersCount
    });
  } catch (error) {
    console.error('Failed to fetch artist profile:', error);
    res.status(500).json({ error: 'Failed to fetch artist profile' });
  }
};

const getArtistDashboard = async (req, res) => {
  const db = getDB();
  try {
    const userId = req.user.userId;

    // Debug: Let's see what artwork types we actually have
    const [artworkDebug] = await db.execute(`
      SELECT artwork_type, COUNT(*) as count 
      FROM artworks WHERE user_id = ? 
      GROUP BY artwork_type
    `, [userId]);
    
    console.log(`Debug - User ${userId} artwork types:`, artworkDebug);

    const [stats] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM artworks WHERE user_id = ?) as totalArtworksAll,
        (SELECT COUNT(*) FROM artworks WHERE user_id = ? AND artwork_type = 'digital') as totalArtworks,
        (SELECT SUM(COALESCE(views, 0)) FROM artworks WHERE user_id = ?) as totalViewsAll,
        (SELECT SUM(COALESCE(views, 0)) FROM artworks WHERE user_id = ? AND artwork_type = 'digital') as totalViews,
        (SELECT SUM(COALESCE(likes, 0)) FROM artworks WHERE user_id = ?) as totalLikesAll,
        (SELECT SUM(COALESCE(likes, 0)) FROM artworks WHERE user_id = ? AND artwork_type = 'digital') as totalLikes,
        (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers,
        (SELECT COUNT(*) FROM auctions WHERE artwork_id IN (SELECT id FROM artworks WHERE user_id = ?) AND status = 'active') as activeAuctions,
        (SELECT COUNT(*) FROM artworks WHERE user_id = ? AND is_ai_generated = 1) as aiContentDetected,
        (SELECT SUM(COALESCE(views, 0)) FROM artworks WHERE user_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())) as newViewsThisMonth,
        (SELECT SUM(COALESCE(likes, 0)) FROM artworks WHERE user_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())) as newLikesThisMonth,
        (SELECT COUNT(*) FROM follows WHERE following_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())) as newFollowersThisMonth,
        (SELECT SUM(oi.price) FROM order_items oi JOIN orders o ON oi.order_id = o.id JOIN artworks a ON oi.artwork_id = a.id WHERE a.user_id = ? AND o.status = 'completed' AND MONTH(o.created_at) = MONTH(CURRENT_DATE()) AND YEAR(o.created_at) = YEAR(CURRENT_DATE())) as salesThisMonth,
        (SELECT availability FROM users WHERE id = ?) as availability
    `, [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId]);

    console.log(`Debug - User ${userId} stats:`, stats[0]);

    const [artworks] = await db.execute(
      'SELECT id, title, price, status, views, likes, thumbnail_image, artwork_type, ai_detection_score FROM artworks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      stats: stats[0],
      artworks,
    });
  } catch (error) {
    console.error('Failed to fetch artist dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch artist dashboard data' });
  }
};

const searchArtists = async (req, res) => {
    const db = getDB();
    try {
        const { skills, software, minPrice, maxPrice, query, availability, minRating } = req.query;

        let sql = `
            SELECT DISTINCT u.id, u.name, u.profile_image, u.bio, u.location,
            (SELECT GROUP_CONCAT(s.name SEPARATOR ', ') FROM artist_skills ask JOIN skills s ON ask.skill_id = s.id WHERE ask.user_id = u.id AND s.type = 'skill') as skills,
            (SELECT AVG(r.rating) FROM reviews r WHERE r.reviewed_id = u.id) as average_rating
            FROM users u
            LEFT JOIN artist_skills ask ON u.id = ask.user_id
            LEFT JOIN skills s ON ask.skill_id = s.id
            LEFT JOIN commission_listings cl ON u.id = cl.artist_id
            WHERE u.user_type = 'artist'
        `;
        
        const params = [];

        if (query) {
            sql += ` AND (u.name LIKE ? OR u.bio LIKE ? OR s.name LIKE ?)`;
            const likeQuery = `%${query}%`;
            params.push(likeQuery, likeQuery, likeQuery);
        }

        if (skills) {
            const skillList = skills.split(',');
            sql += ` AND s.type = 'skill' AND s.name IN (?)`;
            params.push(skillList);
        }
        
        if (availability) {
            sql += ` AND u.availability = ?`;
            params.push(availability);
        }

        if (software) {
            const softwareList = software.split(',');
            // This requires a subquery to check for artists who have ALL specified software skills
            sql += ` AND u.id IN (
                SELECT user_id FROM artist_skills ask_sub 
                JOIN skills s_sub ON ask_sub.skill_id = s_sub.id 
                WHERE s_sub.type = 'software' AND s_sub.name IN (?) 
                GROUP BY user_id 
                HAVING COUNT(DISTINCT s_sub.name) = ?
            )`;
            params.push(softwareList, softwareList.length);
        }

        if (minPrice || maxPrice) {
            sql += ` AND EXISTS (
                SELECT 1 FROM commission_listings cl_price 
                WHERE cl_price.artist_id = u.id AND (`;
            
            if (minPrice && maxPrice) {
                sql += ` JSON_UNQUOTE(JSON_EXTRACT(cl_price.pricing_details, '$[0].price')) BETWEEN ? AND ?`;
                 params.push(minPrice, maxPrice);
            } else if (minPrice) {
                 sql += ` JSON_UNQUOTE(JSON_EXTRACT(cl_price.pricing_details, '$[0].price')) >= ?`;
                 params.push(minPrice);
            } else { // maxPrice only
                 sql += ` JSON_UNQUOTE(JSON_EXTRACT(cl_price.pricing_details, '$[0].price')) <= ?`;
                 params.push(maxPrice);
            }
            sql += `))`;
        }

        sql += ` GROUP BY u.id`;
        
        if (minRating) {
            sql += ` HAVING average_rating >= ?`;
            params.push(minRating);
        }

        const [artists] = await db.query(sql, params);
        res.json(artists);

    } catch (error) {
        console.error("Error searching artists:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateAvailability = async (req, res) => {
    const db = getDB();
    const { availability } = req.body;
    const userId = req.user.id;

    if (!['Open', 'Limited', 'Closed'].includes(availability)) {
        return res.status(400).json({ error: 'Invalid availability status.' });
    }

    try {
        await db.query('UPDATE users SET availability = ? WHERE id = ?', [availability, userId]);
        res.json({ message: 'Availability updated successfully.' });
    } catch (error) {
        console.error(`Error updating availability for user ${userId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getProfile = async (req, res) => {
    const db = getDB();
    const userId = req.user.userId;
    try {
        const [rows] = await db.query('SELECT id, name, email, user_type, profile_image, bio, location, availability FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
};

const updateProfile = async (req, res) => {
    const db = getDB();
    const userId = req.user.userId;
    const { name, bio, location } = req.body;

    // Basic validation
    if (!name) {
        return res.status(400).json({ message: "Name is required." });
    }

    try {
        await db.query(
            'UPDATE users SET name = ?, bio = ?, location = ? WHERE id = ?',
            [name, bio, location, userId]
        );
        res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};


const getArtistEarnings = async (req, res) => {
    const db = getDB();
    const artistId = req.user.userId;

    try {
        const [earnings] = await db.execute(
            'SELECT * FROM artist_earnings WHERE artist_id = ? ORDER BY created_at DESC',
            [artistId]
        );

        const [summaryRows] = await db.execute(
            `SELECT 
                SUM(CASE WHEN status = 'pending_clearance' THEN net_amount ELSE 0 END) as pending_clearance,
                SUM(CASE WHEN status = 'cleared' THEN net_amount ELSE 0 END) as available,
                SUM(CASE WHEN status = 'paid_out' THEN net_amount ELSE 0 END) as withdrawn,
                SUM(net_amount) as total
             FROM artist_earnings 
             WHERE artist_id = ?`,
            [artistId]
        );
        
        const summary = {
            pending_clearance: summaryRows[0].pending_clearance || 0,
            available: summaryRows[0].available || 0,
            withdrawn: summaryRows[0].withdrawn || 0,
            total: summaryRows[0].total || 0
        };

        res.json({ earnings, summary });

    } catch (error) {
        console.error('Error fetching artist earnings:', error);
        res.status(500).json({ error: 'Failed to fetch earnings data.' });
    }
};

const getUserById = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query('SELECT id, name, profile_image, bio, location FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

const getClientDashboard = async (req, res) => {
  const db = getDB();
  try {
    const userId = req.user.userId;

    const [stats] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = 'completed') as totalOrders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = ? AND status = 'completed') as totalSpent,
        (SELECT COUNT(*) FROM projects WHERE client_id = ? AND status IN ('active', 'in_progress')) as activeCommissions,
        (SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = 'completed') as completedPurchases,
        (SELECT COUNT(*) FROM wishlist_items WHERE user_id = ?) as wishlistCount
    `, [userId, userId, userId, userId, userId]);

    res.json(stats[0]);
  } catch (error) {
    console.error('Failed to fetch client dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch client dashboard data' });
  }
};

const getUserBids = async (req, res) => {
  const db = getDB();
  try {
    const userId = req.user.userId;

    const [bids] = await db.execute(`
      SELECT 
        b.id,
        b.auction_id,
        b.amount,
        b.created_at,
        a.current_bid,
        a.status as auction_status,
        a.end_time,
        a.winner_id,
        art.title as artwork_title,
        art.thumbnail_image,
        u.name as artist_name
      FROM bids b
      JOIN auctions a ON b.auction_id = a.id
      JOIN artworks art ON a.artwork_id = art.id
      JOIN users u ON art.user_id = u.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);

    // Add status information for each bid
    const bidsWithStatus = bids.map(bid => ({
      ...bid,
      is_winning: bid.winner_id === userId && bid.auction_status === 'active',
      is_won: bid.winner_id === userId && bid.auction_status === 'completed',
      auction_ended: new Date(bid.end_time) < new Date()
    }));

    res.json(bidsWithStatus);
  } catch (error) {
    console.error('Failed to fetch user bids:', error);
    res.status(500).json({ error: 'Failed to fetch user bids' });
  }
};

const getUserBasicInfo = async (req, res) => {
  const db = getDB();
  try {
    const { id } = req.params;
    const [users] = await db.query(
      'SELECT id, name, profile_image, user_type FROM users WHERE id = ?', 
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Failed to fetch user basic info:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
};

module.exports = {
  getArtistProfile,
  getArtistDashboard,
  searchArtists,
  getProfile,
  updateProfile,
  updateAvailability,
  getArtistEarnings,
  getUserById,
  getClientDashboard,
  getUserBids,
  getUserBasicInfo
}; 