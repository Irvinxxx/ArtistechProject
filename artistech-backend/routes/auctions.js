const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/', auctionController.getAllAuctions);
router.get('/:id', auctionController.getAuctionById);
router.post('/', authenticateToken, authorizeRole('artist'), auctionController.createAuction);
router.post('/:id/bids', authenticateToken, authorizeRole('client'), auctionController.placeBid);
router.post('/:id/watch', authenticateToken, auctionController.watchAuction);
router.get('/:id/watchlist-status', authenticateToken, auctionController.getWatchlistStatus);

module.exports = router; 