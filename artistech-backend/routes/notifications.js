const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticateToken = require('../middleware/authenticateToken');

// Get all notifications for the logged-in user
router.get('/', authenticateToken, notificationController.getNotifications);

// Mark notifications as read
router.post('/read', authenticateToken, notificationController.markAsRead);

module.exports = router;
