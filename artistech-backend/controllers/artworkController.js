const { getDB } = require('../config/db');
const path = require('path');
const fs = require('fs').promises; // Using promises version of fs
const WatermarkService = require('../services/watermarkService');
const { createNotification } = require('../socketManager');
const { detectAiArt } = require('../services/aiDetection'); // Import the AI detection service

const watermarkService = new WatermarkService();





const getAllArtworks = async (req, res) => {
  const db = getDB();
  try {
    const { category, search, sort = 'newest', limit = 10, offset = 0 } = req.query;
    const userId = req.user ? req.user.userId : null;

    let query = `
      SELECT
        a.*,
        u.name as artist_name,
        ${userId ? '(SELECT COUNT(*) FROM likes WHERE likes.artwork_id = a.id AND likes.user_id = ?) > 0' : '0'} as is_liked
      FROM artworks a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = ?`;
      
    const params = [];
    if (userId) params.push(userId);
    params.push('published');

    if (category && category !== 'all') {
      query += ' AND a.category_id = (SELECT id FROM categories WHERE slug = ?)';
      params.push(category);
    }

    if (search) {
      query += ' AND (a.title LIKE ? OR a.description LIKE ? OR u.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // This is complex to do correctly with params, need to adjust query building
    const countQuery = `SELECT COUNT(*) as count FROM artworks a JOIN users u ON a.user_id = u.id WHERE a.status = ?` + 
      (category && category !== 'all' ? ' AND a.category_id = (SELECT id FROM categories WHERE slug = ?)' : '') +
      (search ? ' AND (a.title LIKE ? OR a.description LIKE ? OR u.name LIKE ?)' : '');

    const countParams = ['published'];
    if (category && category !== 'all') countParams.push(category);
    if (search) countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);

    const [totalResult] = await db.execute(countQuery, countParams);
    const total = totalResult[0].count;

    switch (sort) {
      case 'price-asc':
        query += ' ORDER BY a.price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY a.price DESC';
        break;
      case 'likes':
        query += ' ORDER BY a.likes DESC';
        break;
      default: // newest
        query += ' ORDER BY a.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [artworks] = await db.execute(query, params);

    res.json({
      artworks: artworks.map(a => ({...a, is_liked: !!a.is_liked})),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Failed to fetch artworks:', error);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
};

const getArtworkById = async (req, res) => {
  const db = getDB();
  const userId = req.user ? req.user.userId : null;
  try {
    let query = `
      SELECT 
        a.*, 
        u.name as artist_name, 
        u.profile_image as artist_image,
        ${userId ? '(SELECT COUNT(*) FROM likes WHERE likes.artwork_id = a.id AND likes.user_id = ?) > 0' : '0'} as is_liked
      FROM artworks a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.id = ?
    `;
    const params = [];
    if(userId) params.push(userId);
    params.push(req.params.id);

    const [rows] = await db.execute(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    const artwork = rows[0];

    if (!req.session.viewedArtworks) {
      req.session.viewedArtworks = [];
    }
    if (!req.session.viewedArtworks.includes(req.params.id)) {
      await db.execute('UPDATE artworks SET views = views + 1 WHERE id = ?', [req.params.id]);
      req.session.viewedArtworks.push(req.params.id);
    }

    res.json({...artwork, is_liked: !!artwork.is_liked});
  } catch (error) {
    console.error('Failed to fetch artwork:', error);
    res.status(500).json({ error: 'Failed to fetch artwork' });
  }
};

const likeArtwork = async (req, res) => {
  const db = getDB();
  try {
    const artworkId = req.params.id;
    const userId = req.user.userId;

    const [existingLike] = await db.execute(
      'SELECT id FROM likes WHERE user_id = ? AND artwork_id = ?',
      [userId, artworkId]
    );

    if (existingLike.length > 0) {
      await db.execute('DELETE FROM likes WHERE id = ?', [existingLike[0].id]);
      await db.execute('UPDATE artworks SET likes = likes - 1 WHERE id = ?', [artworkId]);
      res.json({ success: true, liked: false, message: 'Artwork unliked' });
    } else {
      await db.execute('INSERT INTO likes (user_id, artwork_id) VALUES (?, ?)', [userId, artworkId]);
      await db.execute('UPDATE artworks SET likes = likes + 1 WHERE id = ?', [artworkId]);

      // --- NOTIFICATION ---
      const [artwork] = await db.execute('SELECT user_id, title FROM artworks WHERE id = ?', [artworkId]);
      const [liker] = await db.execute('SELECT name FROM users WHERE id = ?', [userId]);
      if (artwork.length > 0 && liker.length > 0) {
        const artistId = artwork[0].user_id;
        const artworkTitle = artwork[0].title;
        const likerName = liker[0].name;
        // Notify the artist, but not if they liked their own work
        if (artistId !== userId) {
          await createNotification(
            artistId,
            `${likerName} liked your artwork: "${artworkTitle}"`,
            `/artworks/${artworkId}`
          );
        }
      }
      // --- END NOTIFICATION ---

      res.json({ success: true, liked: true, message: 'Artwork liked' });
    }
  } catch (error) {
    console.error('Failed to like/unlike artwork:', error);
    res.status(500).json({ error: 'Failed to update like status' });
  }
};

const uploadArtwork = async (req, res) => {
  const db = getDB();
  let originalPath; // To store path for cleanup

  try {
    console.log('Upload request body:', req.body);
    console.log('Upload file:', req.file ? req.file.filename : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No artwork file provided' });
    }

    const { title, description, price, category, medium, dimensions, yearCreated, artwork_type } = req.body;
    const userId = req.user.userId;
    
    console.log('Processing upload for user:', userId, 'category:', category);

    const [categoryRow] = await db.execute('SELECT id FROM categories WHERE slug = ?', [category]);
    if (categoryRow.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    const categoryId = categoryRow[0].id;

    originalPath = req.file.path;
    const imageDbPath = `/uploads/${req.file.filename}`;

    // The watermarking service is permanently bypassed to prevent server crashes.
    // Thumbnail will be the same as the original image.

    const [result] = await db.execute(
      'INSERT INTO artworks (user_id, category_id, title, description, price, original_image, thumbnail_image, status, medium, dimensions, year_created, artwork_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, categoryId, title, description, price, imageDbPath, imageDbPath, 'pending_detection', medium, dimensions, yearCreated, artwork_type]
    );

    const newArtworkId = result.insertId;

    // Immediately respond to the user to guarantee a good user experience.
    res.json({
      success: true,
      artworkId: newArtworkId,
      message: 'Artwork uploaded successfully! It is now being analyzed for authenticity.',
    });

    // We push the AI detection to a background task to prevent it from crashing the main request.
    setTimeout(() => {
        processArtworkInBackground(newArtworkId, originalPath, userId).catch(err => {
            console.error(`[FATAL] A background error occurred during artwork processing for artwork ${newArtworkId}:`, err);
        });
    }, 0);

  } catch (error) {
    // This will catch errors from the database insertion or file checks.
    if (originalPath) {
      try {
        await fs.unlink(originalPath); // Clean up the uploaded file on error
      } catch (cleanupError) {
        console.error('Failed to clean up uploaded file after an error:', cleanupError);
      }
    }
    console.error('Artwork upload failed during main process:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
};

// This function runs in the background and does not block the main request flow.
const processArtworkInBackground = async (artworkId, filePath, userId) => {
  const db = getDB();
  let watermarkedDbPath = null;
  const originalDbPath = `/uploads/${path.basename(filePath)}`;

  // --- Step 1: Attempt to create watermark ---
  try {
    const watermarkedFilename = `watermarked-${path.basename(filePath)}`;
    const watermarkedDiskPath = path.join(__dirname, '..', 'uploads', watermarkedFilename);
    await watermarkService.addWatermark(filePath, watermarkedDiskPath);
    watermarkedDbPath = `/uploads/${watermarkedFilename}`;
    console.log(`Watermark created for artwork ${artworkId}`);
  } catch (watermarkError) {
    console.error(`Watermarking failed for artwork ${artworkId}, but proceeding. Error: ${watermarkError.message}`);
    await createNotification(
      userId,
      `Your artwork was uploaded, but we couldn't apply a watermark.`,
      `/artist/dashboard`
    );
  }

  // --- Step 2: Run AI Art Detection ---
  try {
    const detectionResult = await detectAiArt(filePath, userId, artworkId);
    const [artworkRows] = await db.execute('SELECT title FROM artworks WHERE id = ?', [artworkId]);
    if (artworkRows.length === 0) return; 
    const artworkTitle = artworkRows[0].title;

    if (detectionResult.isAiArt) {
      // AI detected: Update status to rejected and notify artist
      // First, update the record with the score and thumbnail, then delete the files.
      await db.execute(
        'UPDATE artworks SET status = ?, ai_detection_score = ?, is_ai_generated = ?, thumbnail_image = ? WHERE id = ?', 
        ['rejected_ai', detectionResult.score, 1, originalDbPath, artworkId]
      );
      await createNotification(
        userId,
        `Your artwork "${artworkTitle}" was rejected as AI-generated (Score: ${detectionResult.score.toFixed(2)}).`,
        `/artist/dashboard`
      );
    } else {
      // No AI detected: Update status to published
      const finalThumbnailPath = watermarkedDbPath || originalDbPath;
      await db.execute(
        'UPDATE artworks SET status = ?, thumbnail_image = ?, ai_detection_score = ?, is_ai_generated = ? WHERE id = ?', 
        ['published', finalThumbnailPath, detectionResult.score, 0, artworkId]
      );
      
      await createNotification(
        userId,
        `Great news! Your artwork "${artworkTitle}" has passed analysis and is now published.`,
        `/artworks/${artworkId}`
      );
      
      // Notify followers
      const [[artist]] = await db.execute('SELECT name FROM users WHERE id = ?', [userId]);
      const [followers] = await db.execute('SELECT follower_id FROM follows WHERE following_id = ?', [userId]);
      
      if (artist && followers.length > 0) {
        const artistName = artist.name;
        const notificationMessage = `${artistName} has uploaded a new artwork: "${artworkTitle}"`;
        const notificationLink = `/artworks/${artworkId}`;
        
        for (const follower of followers) {
          await createNotification(follower.follower_id, notificationMessage, notificationLink);
        }
      }
    }
  } catch (error) {
    console.error(`Background processing (AI/DB update) failed for artwork ${artworkId}:`, error);
    await db.execute('UPDATE artworks SET status = ? WHERE id = ?', ['rejected_error', artworkId]);
    await createNotification(
      userId,
      `We couldn't analyze your artwork. Please contact support.`,
      `/artist/dashboard`
    );
  }
};

const saveDraft = async (req, res) => {
  const db = getDB();
  try {
    const { title, description, price, category, medium, dimensions, yearCreated, artwork_type } = req.body;
    const userId = req.user.userId;

    let originalImagePath = null;
    let thumbnailImagePath = null; // Fix: Add thumbnail path
    if (req.file) {
      originalImagePath = `/uploads/${req.file.filename}`;
      thumbnailImagePath = originalImagePath; // Fix: Set thumbnail to the same as original
    }

    const [categoryRow] = await db.execute('SELECT id FROM categories WHERE slug = ?', [category]);
    if (categoryRow.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    const categoryId = categoryRow[0].id;

    const [result] = await db.execute(
      'INSERT INTO artworks (user_id, category_id, title, description, price, original_image, thumbnail_image, status, medium, dimensions, year_created, artwork_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, categoryId, title, description, price, originalImagePath, thumbnailImagePath, 'draft', medium, dimensions, yearCreated, artwork_type]
    );

    res.json({
      success: true,
      artworkId: result.insertId,
      message: 'Artwork saved as draft',
    });
  } catch (error) {
    console.error('Failed to save draft:', error);
    res.status(500).json({ error: 'Failed to save draft', details: error.message });
  }
};

const updateArtwork = async (req, res) => {
  const db = getDB();
  try {
    const { id } = req.params;
    const { title, description, price, category, medium, dimensions, yearCreated, status, artwork_type } = req.body;
    const userId = req.user.userId;

    const [artworkRows] = await db.execute('SELECT * FROM artworks WHERE id = ? AND user_id = ?', [id, userId]);
    if (artworkRows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to edit this artwork' });
    }
    const artwork = artworkRows[0];
    if (artwork.status.startsWith('rejected')) {
      return res.status(403).json({ error: 'A rejected artwork cannot be edited.' });
    }

    let imagePath = artworkRows[0].original_image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const [categoryRow] = await db.execute('SELECT id FROM categories WHERE slug = ?', [category]);
    const categoryId = categoryRow.length > 0 ? categoryRow[0].id : null;

    await db.execute(
      'UPDATE artworks SET title = ?, description = ?, price = ?, category_id = ?, original_image = ?, status = ?, medium = ?, dimensions = ?, year_created = ?, artwork_type = ? WHERE id = ?',
      [title, description, price, categoryId, imagePath, status, medium, dimensions, yearCreated, artwork_type, id]
    );

    res.json({ success: true, message: 'Artwork updated successfully' });
  } catch (error) {
    console.error('Failed to update artwork:', error);
    res.status(500).json({ error: 'Failed to update artwork', details: error.message });
  }
};

const deleteArtwork = async (req, res) => {
  const db = getDB();
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [artworkRows] = await db.execute('SELECT * FROM artworks WHERE id = ? AND user_id = ?', [id, userId]);
    if (artworkRows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to delete this artwork' });
    }
    const artwork = artworkRows[0];
    if (artwork.status.startsWith('rejected')) {
        return res.status(403).json({ error: 'A rejected artwork cannot be deleted.' });
    }

    await db.execute('DELETE FROM artworks WHERE id = ?', [id]);

    res.json({ success: true, message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Failed to delete artwork:', error);
    res.status(500).json({ error: 'Failed to delete artwork', details: error.message });
  }
};

const downloadArtwork = async (req, res) => {
  const db = getDB();
  let connection;
  try {
    const { id: artworkId } = req.params;
    const userId = req.user.userId;

    connection = await db.getConnection();

    const [artworkRows] = await connection.execute(
      'SELECT original_image, user_id FROM artworks WHERE id = ?',
      [artworkId]
    );

    if (artworkRows.length === 0) {
      return res.status(404).json({ error: 'Artwork not found.' });
    }
    const artwork = artworkRows[0];
    const imagePath = artwork.original_image;

    if (!imagePath) {
      return res.status(404).json({ error: 'No file associated with this artwork.' });
    }

    // First, verify if the user has access (owner or purchaser)
    const isOwner = artwork.user_id === userId;
    let hasPurchased = false;
    if (!isOwner) {
        const [accessRows] = await connection.execute(
            'SELECT id FROM digital_asset_access WHERE user_id = ? AND artwork_id = ?',
            [userId, artworkId]
        );
        hasPurchased = accessRows.length > 0;
    }

    if (!isOwner && !hasPurchased) {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this digital asset.' });
    }
    
    // Now, handle download based on the path type
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // It's a URL, so we send a JSON response telling the frontend to redirect.
      // A direct backend redirect can cause CORS issues with `fetch`.
      return res.json({ downloadUrl: imagePath });
    } else {
      // It's a local file path
      const filePath = path.join(__dirname, '..', imagePath);
      res.download(filePath, (err) => {
        if (err) {
          console.error("--- LOCAL FILE DOWNLOAD ERROR ---", err);
          if (!res.headersSent) {
            res.status(404).json({ error: 'File not found on server.' });
          }
        }
      });
    }
  } catch (error) {
    console.error('--- DOWNLOAD ENDPOINT FAILED ---', error);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
  } finally {
    if (connection) connection.release();
  }
};

const getUserArtworks = async (req, res) => {
  const db = getDB();
  try {
    const userId = req.user.userId;
    const [artworks] = await db.execute(
      'SELECT id, title, description, price, status, views, likes, thumbnail_image, artwork_type, ai_detection_score, is_ai_generated, created_at, updated_at FROM artworks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({ artworks });
  } catch (error) {
    console.error('Failed to fetch user artworks:', error);
    res.status(500).json({ error: 'Failed to fetch user artworks' });
  }
};

const getAiReport = async (req, res) => {
  const db = getDB();
  try {
    const { id: artworkId } = req.params;
    const userId = req.user.userId;

    // First, verify the user owns this artwork
    const [artworkRows] = await db.execute('SELECT id FROM artworks WHERE id = ? AND user_id = ?', [artworkId, userId]);
    if (artworkRows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to view this report.' });
    }

    // Fetch the latest AI detection log for this artwork
    const [reportRows] = await db.execute(
      'SELECT * FROM ai_detection_logs WHERE artwork_id = ? ORDER BY created_at DESC LIMIT 1',
      [artworkId]
    );

    if (reportRows.length === 0) {
      return res.status(404).json({ error: 'No AI detection report found for this artwork.' });
    }

    res.json(reportRows[0]);
  } catch (error) {
    console.error('Failed to fetch AI report:', error);
    res.status(500).json({ error: 'Failed to fetch AI report' });
  }
};

module.exports = {
  getAllArtworks,
  getArtworkById,
  likeArtwork,
  uploadArtwork,
  saveDraft,
  updateArtwork,
  deleteArtwork,
  downloadArtwork,
  getUserArtworks,
  getAiReport,
}; 