const express = require('express');
const router = express.Router();
const projectUpdateController = require('../controllers/projectUpdateController');
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/upload');

// Middleware to authorize that the user is a participant of the project
const authorizeProjectParticipant = projectUpdateController.authorizeProjectParticipant;

// Create a project update (progress report or final delivery)
router.post(
  '/:projectId/updates',
  authenticateToken,
  authorizeProjectParticipant,
  projectUpdateController.createUpdate
);

// Get all updates for a project
router.get(
  '/:projectId/updates',
  authenticateToken,
  authorizeProjectParticipant,
  projectUpdateController.getProjectUpdates
);

// Update a project update
router.put(
  '/updates/:updateId',
  authenticateToken,
  projectUpdateController.updateUpdate
);

// Update the status of a project update
router.put(
  '/updates/:updateId/status',
  authenticateToken,
  projectUpdateController.updateUpdateStatus
);

// Upload files for a project update
router.post(
  '/updates/:updateId/files',
  authenticateToken,
  upload.array('files', 10),
  projectUpdateController.uploadFiles
);

// Delete a project update
router.delete(
  '/updates/:updateId',
  authenticateToken,
  projectUpdateController.deleteUpdate
);

module.exports = router;
