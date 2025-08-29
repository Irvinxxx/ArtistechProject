const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const config = require('../config');

const register = async (req, res) => {
  const db = getDB();
  try {
    const { email, password, name, userType } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (email, password_hash, name, user_type) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, userType || 'artist']
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { userId: userId, email: email, user_type: userType || 'artist' },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: { id: userId, email, name, user_type: userType || 'artist' },
      token,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

const login = async (req, res) => {
  const db = getDB();
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, user_type: user.user_type },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, user_type: user.user_type },
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

const getMe = async (req, res) => {
  const db = getDB();
  try {
    const [rows] = await db.execute('SELECT id, email, name, user_type FROM users WHERE id = ?', [req.user.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Failed to get user data:', error);
    res.status(500).json({ error: 'Failed to get user data', details: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
}; 