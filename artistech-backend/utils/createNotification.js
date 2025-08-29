const { createNotificationInDB } = require('../services/notificationService');
const { emitToUser } = require('../socketManager');

/**
 * Creates a notification, saves it to the DB, and emits a real-time event.
 * This is the primary utility for creating notifications.
 * @param {number} userId - The ID of the user to notify.
 * @param {string} message - The notification message.
 * @param {string} link - The URL link for the notification.
 */
const createAndEmitNotification = async (userId, message, link) => {
    try {
        // Step 1: Save the notification to the database
        const newNotification = await createNotificationInDB(userId, message, link);
        
        // Step 2: Emit the real-time event to the user
        if (newNotification) {
            emitToUser(userId, 'newNotification', newNotification);
        }
        
        return newNotification;
    } catch (error) {
        // Error is already logged in the service, but we can add more context here if needed
        console.error(`Error in createAndEmitNotification flow for user ${userId}:`, error.message);
    }
};

module.exports = {
    createAndEmitNotification
};
