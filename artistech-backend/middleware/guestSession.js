const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/db');

const guestSession = async (req, res, next) => {
  if (req.user) {
    return next();
  }

  const db = getDB();
  let sessionId = req.headers['x-session-id'];

  if (!sessionId) {
    sessionId = uuidv4();
    res.setHeader('X-Session-Id', sessionId);
  }

  try {
    let [cart] = await db.execute('SELECT * FROM carts WHERE session_id = ?', [sessionId]);

    if (cart.length === 0) {
      const [newCart] = await db.execute('INSERT INTO carts (session_id) VALUES (?)', [sessionId]);
      req.sessionCart = { id: newCart.insertId, session_id: sessionId };
    } else {
      req.sessionCart = cart[0];
    }
  } catch (error) {
    console.error('Error with guest session handling:', error);
    return next(error);
  }

  return next();
};

module.exports = guestSession;
