const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

// Create a payment link for a standard artwork purchase from cart
router.post('/create-payment-link', authenticateToken, checkoutController.createPaymentLink);

// Create a payment link for a commission project (simplified system)
router.post('/create-commission-payment-link', authenticateToken, authorizeRole('client'), checkoutController.createCommissionPaymentLink);

// Get the status of a payment for a regular artwork purchase
router.get('/pending-payments/status/:linkId', authenticateToken, checkoutController.getArtworkPaymentStatus);

module.exports = router; 