require('dotenv').config(); // <-- THIS IS THE CRITICAL FIX
const { connectDB, getDB } = require('./config/db');

async function cleanupDuplicates() {
  console.log('Attempting to connect to the database specified in your .env file...');
  await connectDB();
  const pool = getDB(); 
  if (!pool) {
    console.error("Failed to get database pool. Please ensure your database is running and credentials in .env are correct. Exiting.");
    process.exit(1);
  }
  const connection = await pool.getConnection();
  console.log('Database connection acquired.');

  try {
    console.log('Starting cleanup process for duplicate order items...');
    await connection.beginTransaction();

    const [duplicates] = await connection.execute(`
      SELECT order_id, artwork_id, COUNT(*) as count
      FROM order_items
      GROUP BY order_id, artwork_id
      HAVING COUNT(*) > 1
    `);

    if (duplicates.length === 0) {
      console.log('No duplicate order items found. Your database appears to be clean!');
      await connection.commit();
      return;
    }

    console.log(`Found ${duplicates.length} artwork(s) with duplicate entries across various orders.`);

    let totalDeletedCount = 0;

    for (const dup of duplicates) {
      const [[{ min_id }]] = await connection.execute(`
        SELECT MIN(id) as min_id
        FROM order_items
        WHERE order_id = ? AND artwork_id = ?
      `, [dup.order_id, dup.artwork_id]);
      
      const [deleteResult] = await connection.execute(`
        DELETE FROM order_items
        WHERE order_id = ? AND artwork_id = ? AND id <> ?
      `, [dup.order_id, dup.artwork_id, min_id]);

      if (deleteResult.affectedRows > 0) {
          console.log(`- Order #${dup.order_id}, Artwork #${dup.artwork_id}: Kept one, deleted ${deleteResult.affectedRows} duplicate(s).`);
          totalDeletedCount += deleteResult.affectedRows;
      }
    }

    await connection.commit();
    console.log(`\nCleanup complete. A total of ${totalDeletedCount} duplicate order item rows were deleted.`);

  } catch (error) {
    console.error('An error occurred during the cleanup process:', error);
    console.log('Rolling back any changes.');
    await connection.rollback();
  } finally {
    console.log('Releasing database connection.');
    if (connection) connection.release();
    if (pool) await pool.end();
    console.log('Database pool closed. The script will now exit.');
  }
}

cleanupDuplicates();
