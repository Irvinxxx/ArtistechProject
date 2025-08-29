const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillsController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

// Get a list of all available skills and software
router.get('/', skillsController.getAllSkills);

// Get the skills for a specific artist
router.get('/artist/:artistId', skillsController.getArtistSkills);

// Update the logged-in artist's skills
router.put('/artist', authenticateToken, authorizeRole('artist'), skillsController.updateArtistSkills);

module.exports = router;
