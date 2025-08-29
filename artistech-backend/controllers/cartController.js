const { getDB } = require('../config/db');

const getCart = async (req, res) => {
  const db = getDB();
  try {
    const cartId = req.user ? (await getOrCreateUserCart(req.user.userId)).id : req.sessionCart.id;

    if (!cartId) {
      return res.json([]);
    }

    const [cartItems] = await db.execute(
      `SELECT ci.artwork_id, a.title, a.thumbnail_image, a.price, a.artwork_type, u.name as artist_name
       FROM cart_items ci
       JOIN artworks a ON ci.artwork_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );
    res.json(cartItems);
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

const addToCart = async (req, res) => {
  const db = getDB();
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const cartId = req.user ? (await getOrCreateUserCart(req.user.userId, connection)).id : req.sessionCart.id;
    const { artworkId } = req.body;

    if (!artworkId) {
      await connection.rollback();
      return res.status(400).json({ error: 'Artwork ID is required.' });
    }

    const [artworks] = await connection.execute('SELECT * FROM artworks WHERE id = ?', [artworkId]);
    if (artworks.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Artwork not found.' });
    }
    const artwork = artworks[0];
    if (artwork.status !== 'published') {
      await connection.rollback();
      return res.status(400).json({ error: 'Artwork is not available for purchase.' });
    }

    await connection.execute(
      'INSERT INTO cart_items (cart_id, artwork_id, price_at_add) VALUES (?, ?, ?)',
      [cartId, artworkId, artwork.price]
    );

    await connection.execute('UPDATE artworks SET status = "reserved" WHERE id = ?', [artworkId]);

    await connection.commit();

    // After successful insertion, fetch the complete cart item details
    const [addedCartItem] = await connection.execute(
      `SELECT ci.artwork_id, a.title, a.thumbnail_image, a.price, a.artwork_type, u.name as artist_name
       FROM cart_items ci
       JOIN artworks a ON ci.artwork_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE ci.cart_id = ? AND ci.artwork_id = ?`,
      [cartId, artworkId]
    );

    res.status(201).json({
      success: true,
      message: 'Artwork added to cart.',
      cartItem: addedCartItem[0], // Return the newly created cart item object
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('--- ADD TO CART FAILED ---', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

const removeFromCart = async (req, res) => {
  const db = getDB();
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const cartId = req.user ? (await getOrCreateUserCart(req.user.userId, connection)).id : req.sessionCart.id;
    const { artworkId } = req.params;

    const [result] = await connection.execute(
      'DELETE FROM cart_items WHERE cart_id = ? AND artwork_id = ?',
      [cartId, artworkId]
    );

    if (result.affectedRows > 0) {
      await connection.execute('UPDATE artworks SET status = "published" WHERE id = ?', [artworkId]);
    }

    await connection.commit();
    res.json({ success: true, message: 'Artwork removed from cart.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to remove from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart.' });
  } finally {
    if (connection) connection.release();
  }
};

const mergeCart = async (req, res) => {
  const db = getDB();
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { guestCartItems } = req.body; 

    if (!guestCartItems || !Array.isArray(guestCartItems) || guestCartItems.length === 0) {
      await connection.rollback();
      // No items to merge, but it's not an error.
      return res.status(200).json({ message: 'No items to merge.' });
    }

    // Ensure the user has a cart
    let [cartRows] = await connection.execute('SELECT id FROM carts WHERE user_id = ?', [userId]);
    let cartId;
    if (cartRows.length === 0) {
      const [newCart] = await connection.execute('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cartId = newCart.insertId;
    } else {
      cartId = cartRows[0].id;
    }

    // Get existing items in user's cart to avoid duplicates
    const [currentUserCartItems] = await connection.execute('SELECT artwork_id FROM cart_items WHERE cart_id = ?', [cartId]);
    const userArtworkIds = currentUserCartItems.map(item => item.artwork_id);

    // Filter out items already in the user's cart
    const itemsToMerge = guestCartItems.filter(artworkId => !userArtworkIds.includes(artworkId));

    if (itemsToMerge.length > 0) {
      const placeholders = itemsToMerge.map(() => '(?, ?, (SELECT price FROM artworks WHERE id = ?))').join(',');
      const values = itemsToMerge.flatMap(artworkId => [cartId, artworkId, artworkId]);
      
      await connection.execute(
        `INSERT INTO cart_items (cart_id, artwork_id, price_at_add) VALUES ${placeholders}`,
        values
      );
    }

    await connection.commit();
    res.status(200).json({ success: true, message: 'Guest cart merged successfully.' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('--- CART MERGE FAILED ---', error);
    res.status(500).json({ error: 'Internal Server Error during cart merge.' });
  } finally {
    if (connection) connection.release();
  }
};

const getOrCreateUserCart = async (userId, connection) => {
  const db = connection || getDB();
  let [cartRows] = await db.execute('SELECT * FROM carts WHERE user_id = ?', [userId]);
  if (cartRows.length === 0) {
    const [newCart] = await db.execute('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    return { id: newCart.insertId, user_id: userId };
  }
  return cartRows[0];
};


module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  mergeCart,
}; 