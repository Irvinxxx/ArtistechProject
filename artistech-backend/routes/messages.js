const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../middleware/authenticateToken');

// Get all conversations for the logged-in user
router.get('/', authenticateToken, messageController.getConversations);

// Get all messages between the logged-in user and another user
router.get('/:userId', authenticateToken, messageController.getMessages);
router.get('/commission/:commissionId', authenticateToken, messageController.getCommissionMessages);

// Upload image for messages
router.post('/upload-image', authenticateToken, messageController.messageImageUpload.single('image'), messageController.uploadMessageImage);

module.exports = router;
