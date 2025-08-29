const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/earnings', authenticateToken, authorizeRole('artist'), userController.getArtistEarnings);
router.get('/client/dashboard-stats', authenticateToken, authorizeRole('client'), userController.getClientDashboard);
router.get('/bids', authenticateToken, userController.getUserBids);
router.get('/:id/basic-info', userController.getUserBasicInfo);
router.get('/:id', userController.getUserById);


module.exports = router; 