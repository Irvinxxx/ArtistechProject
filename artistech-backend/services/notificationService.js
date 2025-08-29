const { getDB } = require('../config/db');

/**
 * Inserts a notification into the database.
 * @param {number} userId - The ID of the user to notify.
 * @param {string} message - The notification message.
 * @param {string} link - The URL link for the notification.
 * @returns {Promise<object>} The newly created notification object.
 */
const createNotificationInDB = async (userId, message, link) => {
    const db = getDB();
    try {
        const [result] = await db.execute(
            'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)',
            [userId, message, link]
        );
        // The database automatically adds id, is_read, and created_at
        return {
            id: result.insertId,
            user_id: userId,
            message,
            link,
            is_read: 0,
            created_at: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Failed to create notification in DB for user ${userId}:`, error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

module.exports = {
    createNotificationInDB
};
