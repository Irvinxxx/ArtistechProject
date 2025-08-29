const { getDB } = require('../config/db');

/**
 * Fetches a project and all its related details, including project updates.
 * @param {number} projectId - The ID of the project to fetch.
 * @returns {Promise<object|null>} A comprehensive project object or null if not found.
 */
async function getProjectWithDetails(projectId) {
    const db = getDB();

    // 1. Fetch the main project details
    const [projects] = await db.query(
        `SELECT p.*, c.title as commission_title, client.name as client_name, artist.name as artist_name
         FROM projects p
         JOIN commissions c ON p.commission_id = c.id
         JOIN users client ON p.client_id = client.id
         JOIN users artist ON p.artist_id = artist.id
         WHERE p.id = ?`,
        [projectId]
    );

    if (projects.length === 0) {
        return null;
    }
    const project = projects[0];

    // 2. Fetch all project updates for the project
    const [updates] = await db.query(
        'SELECT * FROM project_updates WHERE project_id = ? ORDER BY created_at ASC',
        [projectId]
    );

    // 3. Parse files JSON for each update
    const updatesWithParsedFiles = updates.map(update => ({
        ...update,
        files: update.files ? JSON.parse(update.files) : []
    }));

    project.updates = updatesWithParsedFiles;
    return project;
}

/**
 * Fetches all projects for a given user (as either client or artist).
 * @param {number} userId - The ID of the user.
 * @param {string} role - The role of the user ('client' or 'artist').
 * @returns {Promise<Array<object>>} A list of project records.
 */
async function getProjectsByParticipant(userId, role) {
    const db = getDB();
    const column = role === 'artist' ? 'p.artist_id' : 'p.client_id';

    const [projects] = await db.query(
        `SELECT p.*, c.title as commission_title, client.name as client_name, artist.name as artist_name
         FROM projects p
         JOIN commissions c ON p.commission_id = c.id
         JOIN users client ON p.client_id = client.id
         JOIN users artist ON p.artist_id = artist.id
         WHERE ${column} = ?
         ORDER BY p.updated_at DESC`,
        [userId]
    );
    return projects;
}

/**
 * Checks if a user is a participant (client or artist) in a project.
 * @param {number} projectId - The ID of the project.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<boolean>} True if the user is a participant, false otherwise.
 */
async function isUserProjectParticipant(projectId, userId) {
    const db = getDB();
    const [projects] = await db.query(
        'SELECT id FROM projects WHERE id = ? AND (client_id = ? OR artist_id = ?)',
        [projectId, userId, userId]
    );
    return projects.length > 0;
}


module.exports = {
    getProjectWithDetails,
    getProjectsByParticipant,
    isUserProjectParticipant,
};
