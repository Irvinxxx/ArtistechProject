const { getDB } = require('../config/db');

/**
 * Creates a new project update (progress report or final delivery)
 * @param {number} projectId - The ID of the project
 * @param {object} updateData - The update data
 * @returns {Promise<object>} The database insertion result
 */
async function createUpdate(projectId, updateData) {
  const db = getDB();
  const [result] = await db.query(
    `INSERT INTO project_updates
     (project_id, update_type, title, description, files, is_required, due_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [projectId, updateData.update_type, updateData.title, updateData.description,
     JSON.stringify(updateData.files || []), updateData.is_required || 0,
     updateData.due_date, 'pending']
  );
  return result;
}

/**
 * Gets all updates for a project
 * @param {number} projectId - The ID of the project
 * @returns {Promise<Array<object>>} Array of project updates
 */
async function getProjectUpdates(projectId) {
  const db = getDB();
  const [updates] = await db.query(
    `SELECT pu.* FROM project_updates pu
     WHERE pu.project_id = ?
     ORDER BY pu.created_at ASC`,
    [projectId]
  );
  return updates;
}

/**
 * Updates a project update
 * @param {number} updateId - The ID of the update
 * @param {object} updateData - The new data
 * @returns {Promise<object>} The database update result
 */
async function updateUpdate(updateId, updateData) {
  const db = getDB();
  const [result] = await db.query(
    'UPDATE project_updates SET title = ?, description = ?, files = ? WHERE id = ?',
    [updateData.title, updateData.description, JSON.stringify(updateData.files || []), updateId]
  );
  return result;
}

/**
 * Updates the status of a project update
 * @param {number} updateId - The ID of the update
 * @param {string} status - The new status
 * @returns {Promise<object>} The database update result
 */
async function updateUpdateStatus(updateId, status) {
  const db = getDB();
  const [result] = await db.query(
    'UPDATE project_updates SET status = ? WHERE id = ?',
    [status, updateId]
  );
  return result;
}

/**
 * Gets a single project update by ID
 * @param {number} updateId - The ID of the update
 * @returns {Promise<object|null>} The update object or null
 */
async function getUpdateById(updateId) {
  const db = getDB();
  const [updates] = await db.query(
    'SELECT * FROM project_updates WHERE id = ?',
    [updateId]
  );
  return updates.length > 0 ? updates[0] : null;
}

/**
 * Updates project status based on update submissions
 * @param {number} projectId - The ID of the project
 * @param {string} updateType - The type of update
 * @param {string} newStatus - The new status for the update
 */
async function updateProjectStatusForUpdate(projectId, updateType, newStatus) {
  const db = getDB();

  const statusMap = {
    'progress_report': {
      'submitted': 'pending_progress_report',
      'approved': 'in_progress'
    },
    'final_delivery': {
      'submitted': 'pending_client_approval',
      'approved': 'completed'
    }
  };

  if (statusMap[updateType] && statusMap[updateType][newStatus]) {
    await db.query(
      'UPDATE projects SET status = ? WHERE id = ?',
      [statusMap[updateType][newStatus], projectId]
    );
  }
}

/**
 * Deletes a project update
 * @param {number} updateId - The ID of the update to delete
 * @returns {Promise<object>} The database deletion result
 */
async function deleteUpdate(updateId) {
  const db = getDB();
  const [result] = await db.query('DELETE FROM project_updates WHERE id = ?', [updateId]);
  return result;
}

module.exports = {
  createUpdate,
  getProjectUpdates,
  updateUpdate,
  updateUpdateStatus,
  getUpdateById,
  updateProjectStatusForUpdate,
  deleteUpdate,
};
