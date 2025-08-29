const { getDB } = require('../config/db');
const multer = require('multer');
const path = require('path');

const getConversations = async (req, res) => {
  const db = getDB();
  const userId = req.user.userId;

  try {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.profile_image,
        (SELECT m.message_text FROM messages m WHERE (m.sender_id = u.id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = u.id) ORDER BY m.created_at DESC LIMIT 1) as last_message,
        (SELECT m.created_at FROM messages m WHERE (m.sender_id = u.id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = u.id) ORDER BY m.created_at DESC LIMIT 1) as last_message_date
      FROM users u
      JOIN (
        SELECT DISTINCT sender_id as user_id FROM messages WHERE receiver_id = ?
        UNION
        SELECT DISTINCT receiver_id as user_id FROM messages WHERE sender_id = ?
      ) as conversations ON u.id = conversations.user_id
      WHERE u.id != ?
      ORDER BY last_message_date DESC;
    `;
    const [conversations] = await db.execute(query, [userId, userId, userId, userId, userId, userId, userId]);
    res.json(conversations);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

const getMessages = async (req, res) => {
  const db = getDB();
  const userId = req.user.userId;
  const otherUserId = req.params.userId;

  try {
    const query = `
      SELECT m.id, m.sender_id, m.receiver_id, m.message_text, m.message_type, m.file_url, m.created_at, u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC;
    `;
    const [messages] = await db.execute(query, [userId, otherUserId, otherUserId, userId]);
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const getCommissionMessages = async (req, res) => {
    const db = getDB();
    const { commissionId } = req.params;
    const userId = req.user.id;

    try {
        // Verify user is part of the commission
        const [commissions] = await db.query('SELECT client_id, artist_id FROM commissions WHERE id = ?', [commissionId]);
        if (commissions.length === 0 || (commissions[0].client_id !== userId && commissions[0].artist_id !== userId)) {
            return res.status(403).json({ error: 'Not authorized to view these messages.' });
        }
        
        const [messages] = await db.query(
            `SELECT m.*, u.name as sender_name 
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.commission_id = ? 
             ORDER BY m.created_at ASC`,
            [commissionId]
        );
        res.json(messages);
    } catch (error) {
        console.error(`Error fetching messages for commission ${commissionId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Configure multer for message image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'message-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const messageImageUpload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const uploadMessageImage = async (req, res) => {
  const db = getDB();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { receiverId, projectId } = req.body;
    const senderId = req.user.userId;
    const imageUrl = `/uploads/${req.file.filename}`;

    const [result] = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, message_text, message_type, file_url, project_id) VALUES (?, ?, ?, ?, ?, ?)',
      [senderId, receiverId, '', 'image', imageUrl, projectId || null]
    );

    const [newMessage] = await db.execute(`
      SELECT m.id, m.sender_id, m.receiver_id, m.message_text, m.message_type, m.file_url, m.created_at, u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.json({
      success: true,
      message: newMessage[0]
    });
  } catch (error) {
    console.error('Failed to upload message image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  getCommissionMessages,
  uploadMessageImage,
  messageImageUpload
};
