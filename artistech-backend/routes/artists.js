const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const followController = require('../controllers/followController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/search', userController.searchArtists);
router.get('/dashboard', authenticateToken, authorizeRole('artist'), userController.getArtistDashboard);
router.get('/:id', userController.getArtistProfile);

// New route for updating availability
router.put('/availability', authenticateToken, authorizeRole('artist'), userController.updateAvailability);

// Follow Routes
router.post('/:artistId/follow', authenticateToken, authorizeRole('client'), followController.followArtist);
router.delete('/:artistId/follow', authenticateToken, authorizeRole('client'), followController.unfollowArtist);
router.get('/:artistId/follow-status', authenticateToken, followController.getFollowStatus);

module.exports = router;