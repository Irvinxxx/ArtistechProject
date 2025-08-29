const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateExistingData() {
  let db;
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'artistech_db',
    });
    
    console.log('Connected to database. Updating existing data for digital transformation...');

    // Convert all artworks to digital type
    const [updateResult] = await db.execute(`
      UPDATE artworks 
      SET artwork_type = 'digital' 
      WHERE artwork_type IS NULL OR artwork_type = 'physical'
    `);
    console.log(`Updated ${updateResult.affectedRows} artworks to digital type`);

    // Add some sample views and likes to existing artworks (if they're NULL or 0)
    const [viewsResult] = await db.execute(`
      UPDATE artworks 
      SET views = FLOOR(RAND() * 100) + 10,
          likes = FLOOR(RAND() * 50) + 5
      WHERE views IS NULL OR views = 0 OR likes IS NULL OR likes = 0
    `);
    console.log(`Updated ${viewsResult.affectedRows} artworks with sample views/likes`);

    // Make sure all artworks are published and portfolio pieces
    const [statusResult] = await db.execute(`
      UPDATE artworks 
      SET status = 'published',
          is_portfolio_piece = 1
      WHERE status != 'published' OR is_portfolio_piece != 1
    `);
    console.log(`Updated ${statusResult.affectedRows} artworks to published status and portfolio pieces`);

    console.log('✅ Database update completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to update database:', error);
  } finally {
    if (db) await db.end();
  }
}

updateExistingData();
