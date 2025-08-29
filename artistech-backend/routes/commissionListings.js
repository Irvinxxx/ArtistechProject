const express = require('express');
const router = express.Router();
const commissionListingController = require('../controllers/commissionListingController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

// Get all listings for the authenticated artist (artist only)
router.get('/my-listings', authenticateToken, authorizeRole('artist'), commissionListingController.getMyListings);

// Get all listings for a specific artist (public)
router.get('/artist/:artistId', commissionListingController.getArtistListings);

// Get a single listing by ID (public)
router.get('/:id', commissionListingController.getListingById);

// Create a new listing (artist only)
router.post('/', authenticateToken, authorizeRole('artist'), commissionListingController.createListing);

// Update a listing (artist only, must be owner)
router.put('/:id', authenticateToken, authorizeRole('artist'), commissionListingController.updateListing);

// Update listing status (artist only, must be owner)
router.put('/:id/status', authenticateToken, authorizeRole('artist'), commissionListingController.updateListingStatus);

// Delete (archive) a listing (artist only, must be owner)
router.delete('/:id', authenticateToken, authorizeRole('artist'), commissionListingController.deleteListing);

module.exports = router;
