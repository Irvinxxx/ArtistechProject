const { getDB } = require('../config/db');

const getWishlist = async (req, res) => {
  const db = getDB();
  try {
    const [rows] = await db.execute(
      `SELECT
        w.id as wishlist_item_id,
        a.*,
        c.name as category_name,
        u.name as artist_name
      FROM wishlist_items w
      JOIN artworks a ON w.artwork_id = a.id
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.user_id = u.id
      WHERE w.user_id = ?`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addToWishlist = async (req, res) => {
  const db = getDB();
  const connection = await db.getConnection();
  const userId = req.user.userId;
  const { artworkId } = req.body;

  if (!artworkId) {
    return res.status(400).json({ error: 'Artwork ID is required' });
  }

  try {
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND artwork_id = ?',
      [userId, artworkId]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'Artwork is already in your wishlist.' });
    }

    await connection.execute(
      'INSERT INTO wishlist_items (user_id, artwork_id) VALUES (?, ?)',
      [userId, artworkId]
    );

    await connection.commit();
    res.status(201).json({ message: 'Artwork added to wishlist' });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to add to wishlist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
};

const removeFromWishlist = async (req, res) => {
  const db = getDB();
  const connection = await db.getConnection();
  try {
    const userId = req.user.userId;
    const { artworkId } = req.params;

    await connection.beginTransaction();

    const [result] = await connection.execute(
      'DELETE FROM wishlist_items WHERE user_id = ? AND artwork_id = ?',
      [userId, artworkId]
    );

    await connection.commit();
    res.json({ success: true, message: 'Artwork removed from wishlist' });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to remove from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
}; 