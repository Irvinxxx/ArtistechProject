const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artworkController');
const authenticateToken = require('../middleware/authenticateToken');
const authenticateTokenOptional = require('../middleware/authenticateTokenOptional');
const upload = require('../middleware/upload');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/', authenticateTokenOptional, artworkController.getAllArtworks);
router.get('/user-artworks', authenticateToken, artworkController.getUserArtworks);
router.get('/:id', authenticateTokenOptional, artworkController.getArtworkById);
router.post('/:id/like', authenticateToken, artworkController.likeArtwork);
router.get('/:id/download', authenticateToken, artworkController.downloadArtwork);
router.get('/:id/ai-report', authenticateToken, authorizeRole('artist'), artworkController.getAiReport);



router.post('/upload-artwork', authenticateToken, authorizeRole('artist'), upload.single('artwork'), artworkController.uploadArtwork);
router.post('/draft', authenticateToken, authorizeRole('artist'), upload.single('artwork'), artworkController.saveDraft);
router.put('/:id', authenticateToken, authorizeRole('artist'), upload.single('artwork'), artworkController.updateArtwork);
router.delete('/:id', authenticateToken, authorizeRole('artist'), artworkController.deleteArtwork);

module.exports = router; 