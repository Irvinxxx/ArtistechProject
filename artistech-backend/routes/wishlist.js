const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/', authenticateToken, authorizeRole('client'), wishlistController.getWishlist);
router.post('/', authenticateToken, authorizeRole('client'), wishlistController.addToWishlist);
router.delete('/:artworkId', authenticateToken, authorizeRole('client'), wishlistController.removeFromWishlist);

module.exports = router; 