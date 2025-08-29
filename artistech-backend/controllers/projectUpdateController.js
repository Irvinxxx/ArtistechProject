const { getDB } = require('../config/db');
const projectUpdates = require('../models/projectUpdates');
const { createNotification } = require('../socketManager');

// Middleware to authorize that the user is a participant of the project
const authorizeProjectParticipant = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const db = getDB();

    const [projects] = await db.execute(
      'SELECT client_id, artist_id FROM projects WHERE id = ?',
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];
    if (project.client_id !== userId && project.artist_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.project = project;
    req.projectId = projectId;
    next();
  } catch (error) {
    console.error('Error in project participant authorization:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a project update (progress report or final delivery)
exports.createUpdate = async (req, res) => {
  const { projectId } = req.params;
  const { updateType, title, description, files } = req.body;
  const userId = req.user.userId;

  if (!updateType || !title || !description) {
    return res.status(400).json({
      error: 'Update type, title, and description are required.'
    });
  }

  if (!['progress_report', 'final_delivery'].includes(updateType)) {
    return res.status(400).json({
      error: 'Invalid update type. Must be progress_report or final_delivery.'
    });
  }

  try {
    const result = await projectUpdates.createUpdate(projectId, {
      update_type: updateType,
      title,
      description,
      files: files || []
    });

    res.status(201).json({
      message: 'Update created successfully',
      updateId: result.insertId
    });
  } catch (error) {
    console.error('Error creating project update:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
};

// Get all updates for a project
exports.getProjectUpdates = async (req, res) => {
  const { projectId } = req.params;

  try {
    const updates = await projectUpdates.getProjectUpdates(projectId);

    // Parse files JSON for each update
    const updatesWithParsedFiles = updates.map(update => ({
      ...update,
      files: update.files ? JSON.parse(update.files) : []
    }));

    res.json(updatesWithParsedFiles);
  } catch (error) {
    console.error('Error fetching project updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
};

// Update a project update
exports.updateUpdate = async (req, res) => {
  const { updateId } = req.params;
  const { title, description, files } = req.body;
  const userId = req.user.userId;

  try {
    // Check if user has permission to update this update
    const update = await projectUpdates.getUpdateById(updateId);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    // Only artists can update their own updates
    const db = getDB();
    const [projects] = await db.execute(
      'SELECT artist_id FROM projects WHERE id = ?',
      [update.project_id]
    );

    if (projects.length === 0 || projects[0].artist_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await projectUpdates.updateUpdate(updateId, {
      title,
      description,
      files: files || []
    });

    res.json({ message: 'Update updated successfully' });
  } catch (error) {
    console.error('Error updating project update:', error);
    res.status(500).json({ error: 'Failed to update update' });
  }
};

// Update the status of a project update
exports.updateUpdateStatus = async (req, res) => {
  const { updateId } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;

  if (!['pending', 'submitted', 'approved', 'requires_revision'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status. Must be pending, submitted, approved, or requires_revision.'
    });
  }

  try {
    const update = await projectUpdates.getUpdateById(updateId);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    const db = getDB();
    const [projects] = await db.execute(
      'SELECT client_id, artist_id, commission_id FROM projects WHERE id = ?',
      [update.project_id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];

    // Artists can only submit their own updates
    if (status === 'submitted' && project.artist_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Clients can only approve updates for their projects
    if (['approved', 'requires_revision'].includes(status) && project.client_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update the status
    await projectUpdates.updateUpdateStatus(updateId, status);

    // Update project status based on update status
    await projectUpdates.updateProjectStatusForUpdate(update.project_id, update.update_type, status);

    // Create notification
    let notificationMessage = '';
    let notificationRecipient = null;

    if (status === 'submitted') {
      notificationMessage = `New ${update.update_type.replace('_', ' ')} submitted for your project`;
      notificationRecipient = project.client_id;
    } else if (status === 'approved') {
      notificationMessage = `Your ${update.update_type.replace('_', ' ')} has been approved`;
      notificationRecipient = project.artist_id;
    } else if (status === 'requires_revision') {
      notificationMessage = `Your ${update.update_type.replace('_', ' ')} requires revision`;
      notificationRecipient = project.artist_id;
    }

    if (notificationMessage && notificationRecipient) {
      await createNotification(
        notificationRecipient,
        notificationMessage,
        `/project/${update.project_id}`
      );
    }

    res.json({ message: 'Update status updated successfully' });
  } catch (error) {
    console.error('Error updating update status:', error);
    res.status(500).json({ error: 'Failed to update update status' });
  }
};

// Upload files for a project update
exports.uploadFiles = async (req, res) => {
  const { updateId } = req.params;
  const userId = req.user.userId;

  try {
    const update = await projectUpdates.getUpdateById(updateId);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    // Check permissions
    const db = getDB();
    const [projects] = await db.execute(
      'SELECT artist_id FROM projects WHERE id = ?',
      [update.project_id]
    );

    if (projects.length === 0 || projects[0].artist_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const uploadedFiles = req.files ? req.files.map(file => ({
      name: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

    // Get existing files
    const existingFiles = update.files ? JSON.parse(update.files) : [];

    // Combine existing and new files
    const allFiles = [...existingFiles, ...uploadedFiles];

    // Update the files
    await db.query(
      'UPDATE project_updates SET files = ? WHERE id = ?',
      [JSON.stringify(allFiles), updateId]
    );

    res.json({
      message: 'Files uploaded successfully',
      files: allFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
};

// Delete a project update
exports.deleteUpdate = async (req, res) => {
  const { updateId } = req.params;
  const userId = req.user.userId;

  try {
    const update = await projectUpdates.getUpdateById(updateId);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    // Only artists can delete their own updates and only if they're pending
    const db = getDB();
    const [projects] = await db.execute(
      'SELECT artist_id FROM projects WHERE id = ?',
      [update.project_id]
    );

    if (projects.length === 0 || projects[0].artist_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (update.status !== 'pending') {
      return res.status(400).json({
        error: 'Cannot delete submitted updates'
      });
    }

    await projectUpdates.deleteUpdate(updateId);
    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Error deleting update:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
};

module.exports = {
  authorizeProjectParticipant
};
