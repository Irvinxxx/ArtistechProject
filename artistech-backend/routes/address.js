const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

// All address routes are for clients only
router.use(authenticateToken, authorizeRole('client'));

router.get('/', addressController.getAddresses);
router.post('/', addressController.addAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/set-default', addressController.setDefaultAddress);

module.exports = router; 