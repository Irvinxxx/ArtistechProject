const { getDB } = require('../config/db');
const { createNotification } = require('../socketManager');

const processEndedAuctions = async () => {
  const db = getDB();
  const connection = await db.getConnection(); 

  try {
    await connection.beginTransaction();

    const [auctions] = await connection.execute(
      `SELECT * FROM auctions WHERE status = 'active' AND end_time <= NOW() FOR UPDATE`
    );

    if (auctions.length === 0) {
      // No auctions to process, this is a normal check.
      console.log('No ended auctions to process at this time.');
      await connection.commit();
      return;
    }

    for (const auction of auctions) {
      const [bids] = await connection.execute(
        `SELECT * FROM bids WHERE auction_id = ? ORDER BY amount DESC, created_at ASC LIMIT 1`,
        [auction.id]
      );

      let winnerId = null;
      let finalPrice = auction.current_bid;

      if (bids.length > 0) {
        const winningBid = bids[0];
        
        if (auction.reserve_price && finalPrice < auction.reserve_price) {
          // Reserve not met, no winner
          await connection.execute(`UPDATE auctions SET status = 'ended' WHERE id = ?`, [auction.id]);
        } else {
          // We have a winner
          winnerId = winningBid.user_id;
          
          await connection.execute(
            `UPDATE auctions SET status = 'ended', winner_id = ? WHERE id = ?`,
            [winnerId, auction.id]
          );

          // Create an order for the winner
          const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?, ?, ?, ?)',
            [winnerId, finalPrice, 'pending_payment', null] 
          );
          const orderId = orderResult.insertId;
          
          const [artwork] = await connection.execute('SELECT title, price FROM artworks WHERE id = ?', [auction.artwork_id]);

          await connection.execute(
            'INSERT INTO order_items (order_id, artwork_id, title, price, quantity) VALUES (?, ?, ?, ?, ?)',
            [orderId, auction.artwork_id, artwork[0].title, finalPrice, 1]
          );
          
          await connection.execute('UPDATE artworks SET status = ? WHERE id = ?', ['sold', auction.artwork_id]);
          
          // --- NOTIFICATIONS ---
          // Notify winner
          await createNotification(
            winnerId,
            `Congratulations! You won the auction for "${artwork[0].title}".`,
            `/checkout` // Or a specific order page
          );
          // Notify artist
           const [artist] = await connection.execute('SELECT user_id FROM artworks WHERE id = ?', [auction.artwork_id]);
           if (artist.length > 0) {
               await createNotification(
                   artist[0].user_id,
                   `Your auction for "${artwork[0].title}" has ended and was sold.`,
                   `/artist/dashboard` // Or a specific sales page
               );
           }
          // --- END NOTIFICATIONS ---
        }
      } else {
        // No bids on the auction
        await connection.execute(`UPDATE auctions SET status = 'ended' WHERE id = ?`, [auction.id]);
        
        // --- NOTIFICATION ---
        // Notify artist that auction ended with no bids
        const [artwork] = await connection.execute('SELECT user_id, title FROM artworks WHERE id = ?', [auction.artwork_id]);
        if(artwork.length > 0) {
            await createNotification(
                artwork[0].user_id,
                `Your auction for "${artwork[0].title}" has ended without any bids.`,
                `/auctions/${auction.id}`
            );
        }
        // --- END NOTIFICATION ---
      }
    }
    
    await connection.commit();
    console.log(`Successfully processed ${auctions.length} ended auctions.`);

  } catch (error) {
    await connection.rollback();
    console.error('Error processing ended auctions:', error);
  } finally {
    connection.release();
  }
};

module.exports = { processEndedAuctions }; 