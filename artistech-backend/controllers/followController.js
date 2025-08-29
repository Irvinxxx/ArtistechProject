const { getDB } = require('../config/db');
const { createNotification } = require('../socketManager');

const followArtist = async (req, res) => {
  const db = getDB();
  try {
    const followerId = req.user.userId;
    const { artistId } = req.params;

    if (parseInt(followerId, 10) === parseInt(artistId, 10)) {
        return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const [existingFollow] = await db.execute(
      'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, artistId]
    );

    if (existingFollow.length > 0) {
      return res.status(409).json({ error: 'You are already following this artist.' });
    }

    await db.execute(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, artistId]
    );

    // --- NOTIFICATION ---
    const [follower] = await db.execute('SELECT name FROM users WHERE id = ?', [followerId]);
    if (follower.length > 0) {
        await createNotification(
            artistId,
            `${follower[0].name} started following you.`,
            `/artists/${followerId}`
        );
    }
    // --- END NOTIFICATION ---

    res.status(201).json({ success: true, message: 'Successfully followed artist.' });
  } catch (error) {
    console.error('Failed to follow artist:', error);
    res.status(500).json({ error: 'Failed to follow artist.' });
  }
};

const unfollowArtist = async (req, res) => {
  const db = getDB();
  try {
    const followerId = req.user.userId;
    const { artistId } = req.params;

    const [result] = await db.execute(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, artistId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'You are not following this artist.' });
    }

    res.status(200).json({ success: true, message: 'Successfully unfollowed artist.' });
  } catch (error) {
    console.error('Failed to unfollow artist:', error);
    res.status(500).json({ error: 'Failed to unfollow artist.' });
  }
};

const getFollowStatus = async (req, res) => {
  const db = getDB();
  try {
    const viewerId = req.user ? req.user.userId : null;
    const { artistId } = req.params;

    // Get follower count for this artist
    const [followerCount] = await db.execute(
        'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
        [artistId]
    );
    const followersCount = followerCount[0].count;

    if (!viewerId) {
        return res.json({ 
            isFollowing: false, 
            followersCount 
        });
    }

    const [rows] = await db.execute(
        'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
        [viewerId, artistId]
    );

    res.json({ 
        isFollowing: rows.length > 0, 
        followersCount 
    });
  } catch (error) {
    console.error('Failed to get follow status:', error);
    res.status(500).json({ error: 'Failed to get follow status.' });
  }
};

module.exports = {
  followArtist,
  unfollowArtist,
  getFollowStatus,
};
