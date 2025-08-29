const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/orders/:orderId/review', authenticateToken, reviewController.createReview);
router.get('/artists/:id/reviews', reviewController.getReviewsForArtist);

module.exports = router; 