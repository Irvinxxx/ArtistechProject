const { getDB } = require('../config/db');
const projectUpdates = require('../models/projectUpdates');

// Simple project authorization middleware
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
        console.error('Error in project authorization:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET /api/projects/:projectId - Get project details with updates
exports.getProjectDetails = async (req, res) => {
    try {
        const projectId = req.projectId;
        const db = getDB();

        // Get project with commission details
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
            return res.status(404).json({ error: 'Project not found.' });
        }

        const project = projects[0];

        // Get project updates
        project.updates = await projectUpdates.getProjectUpdates(projectId);

        res.json(project);
    } catch (error) {
        console.error(`Error fetching project details for ${req.projectId}:`, error);
        res.status(500).json({ error: 'Failed to fetch project details' });
    }
};

// GET /api/projects/artist - Get all projects for the logged-in artist
exports.getArtistProjects = async (req, res) => {
    try {
        const projects = await getProjectsByParticipant(req.user.userId, 'artist');
        res.json(projects);
    } catch (error) {
        console.error(`Error fetching projects for artist ${req.user.userId}:`, error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

// GET /api/projects/client - Get all projects for the logged-in client
exports.getClientProjects = async (req, res) => {
    try {
        const projects = await getProjectsByParticipant(req.user.userId, 'client');
        res.json(projects);
    } catch (error) {
        console.error(`Error fetching projects for client ${req.user.userId}:`, error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

// Helper function to get projects by participant
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



module.exports = {
    authorizeProjectParticipant,
    getProjectDetails,
    getArtistProjects,
    getClientProjects
};
