const { getDB } = require('../config/db');

const getNotifications = async (req, res) => {
  const db = getDB();
  const userId = req.user.userId;
  try {
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Failed to get notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
};

const markAsRead = async (req, res) => {
  const db = getDB();
  const userId = req.user.userId;
  const { notificationIds } = req.body; // Expect an array of IDs

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ error: 'Notification IDs must be a non-empty array.' });
  }

  try {
    const placeholders = notificationIds.map(() => '?').join(',');
    await db.execute(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`,
      [userId, ...notificationIds]
    );
    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
