const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken, orderController.getOrderHistory);
router.get('/artist', authenticateToken, orderController.getOrdersForArtist);
router.get('/artist/sales', authenticateToken, orderController.getSalesHistoryForArtist);
router.put('/:orderId/ship', authenticateToken, orderController.markOrderAsShipped);

module.exports = router; 