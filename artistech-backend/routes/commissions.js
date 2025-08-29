const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');
const upload = require('../middleware/upload');

// Get all commissions for the logged-in user (client or artist)
router.get('/my-commissions', authenticateToken, commissionController.getMyCommissions);

// Browse public commission requests (for artists to discover work)
router.get('/browse', authenticateToken, authorizeRole('artist'), commissionController.browseCommissions);

// Client creates a new commission request (direct to specific artist)
router.post('/request', authenticateToken, authorizeRole('client'), upload.array('reference_images', 5), commissionController.createCommissionRequest);

// Client creates a public commission request (open to all artists)
router.post('/public-request', authenticateToken, authorizeRole('client'), upload.array('reference_images', 5), commissionController.createPublicCommissionRequest);

// Artist creates a new proposal for a request
router.post('/proposal', authenticateToken, authorizeRole('artist'), commissionController.createProposal);

// Get all proposals for a specific commission request
router.get('/:commissionId/proposals', authenticateToken, authorizeRole('client'), commissionController.getProposalsForCommission);

// Get a single commission by ID
router.get('/:commissionId', authenticateToken, commissionController.getCommissionById);

// Client accepts a proposal
router.post('/proposals/:proposalId/accept', authenticateToken, authorizeRole('client'), commissionController.acceptProposal);


module.exports = router;
