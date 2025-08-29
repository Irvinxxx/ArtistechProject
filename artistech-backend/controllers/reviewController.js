const { getDB } = require('../config/db');

const createReview = async (req, res) => {
  const db = getDB();
  try {
    const { orderId } = req.params;
    const { rating, review_text, artworkId } = req.body;
    const reviewerId = req.user.userId;

    // Verify the user owns this order
    const [orderRows] = await db.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, reviewerId]);
    if (orderRows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to review this order.' });
    }
    
    // Verify the artwork is part of the order
    const [orderItemRows] = await db.execute('SELECT artwork_id FROM order_items WHERE order_id = ? AND artwork_id = ?', [orderId, artworkId]);
    if (orderItemRows.length === 0) {
      return res.status(404).json({ error: 'The specified artwork is not part of this order.' });
    }

    // --- NEW: Check for existing review ---
    const [existingReview] = await db.execute(
      'SELECT id FROM reviews WHERE reviewer_id = ? AND artwork_id = ?',
      [reviewerId, artworkId]
    );
    if (existingReview.length > 0) {
      return res.status(409).json({ error: 'You have already reviewed this artwork.' });
    }
    // --- END NEW CHECK ---

    // Get the artist's ID to set as the reviewedId
    const [artworkRows] = await db.execute('SELECT user_id FROM artworks WHERE id = ?', [artworkId]);
    if (artworkRows.length === 0) {
      return res.status(404).json({ error: 'Artwork not found.' });
    }
    const reviewedId = artworkRows[0].user_id;

    await db.execute(
      'INSERT INTO reviews (reviewer_id, reviewed_id, order_id, artwork_id, rating, review_text) VALUES (?, ?, ?, ?, ?, ?)',
      [reviewerId, reviewedId, orderId, artworkId, rating, review_text]
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Failed to submit review:', error);
    res.status(500).json({ error: 'Failed to submit review', details: error.message });
  }
};

const getReviewsForArtist = async (req, res) => {
  const db = getDB();
  try {
    const { id } = req.params;
    const [reviews] = await db.execute(
      `SELECT
        r.rating,
        r.review_text,
        r.created_at,
        u.name as reviewer_name,
        a.title as artwork_title,
        a.thumbnail_image as artwork_thumbnail,
        a.id as artwork_id
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      LEFT JOIN artworks a ON r.artwork_id = a.id
      WHERE r.reviewed_id = ?
      ORDER BY r.created_at DESC`,
      [id]
    );
    res.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = {
  createReview,
  getReviewsForArtist,
}; 