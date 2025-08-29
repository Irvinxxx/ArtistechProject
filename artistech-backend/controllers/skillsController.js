const { getDB } = require('../config/db');

// Get all available skills
exports.getAllSkills = async (req, res) => {
    const db = getDB();
    try {
        const [skills] = await db.query('SELECT * FROM skills ORDER BY type, name');
        res.json(skills);
    } catch (error) {
        console.error("Error fetching skills:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get an artist's selected skills
exports.getArtistSkills = async (req, res) => {
    const db = getDB();
    const { artistId } = req.params;
    try {
        const [artistSkills] = await db.query(
            `SELECT s.id, s.name, s.type, ask.proficiency 
             FROM artist_skills ask
             JOIN skills s ON ask.skill_id = s.id
             WHERE ask.user_id = ?`,
            [artistId]
        );
        res.json(artistSkills);
    } catch (error) {
        console.error(`Error fetching skills for artist ${artistId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update an artist's skills
exports.updateArtistSkills = async (req, res) => {
    const artistId = req.user.userId; // From authenticateToken middleware
    const { skills } = req.body; // Expecting an array of { skill_id, proficiency }

    if (!Array.isArray(skills)) {
        return res.status(400).json({ error: 'Skills data must be an array.' });
    }

    const connection = await getDB().getConnection();

    try {
        await connection.beginTransaction();

        // Clear existing skills for the artist
        await connection.query('DELETE FROM artist_skills WHERE user_id = ?', [artistId]);

        // Insert new skills if the array is not empty
        if (skills.length > 0) {
            const values = skills.map(skill => [artistId, skill.skill_id, skill.proficiency]);
            await connection.query(
                'INSERT INTO artist_skills (user_id, skill_id, proficiency) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Skills updated successfully.' });

    } catch (error) {
        await connection.rollback();
        console.error(`Error updating skills for artist ${artistId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        connection.release();
    }
};
