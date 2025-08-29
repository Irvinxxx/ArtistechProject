const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticateToken = require('../middleware/authenticateToken');
const authenticateTokenOptional = require('../middleware/authenticateTokenOptional');
const guestSession = require('../middleware/guestSession');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/', authenticateTokenOptional, guestSession, cartController.getCart);
router.post('/items', authenticateTokenOptional, guestSession, cartController.addToCart);
router.delete('/items/:artworkId', authenticateTokenOptional, guestSession, cartController.removeFromCart);
router.post('/merge', authenticateToken, authorizeRole('client'), cartController.mergeCart);

module.exports = router; 