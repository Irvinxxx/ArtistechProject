const { getDB } = require('../config/db');
const { createNotification } = require('../socketManager');

const CLEARANCE_DAYS = 7;

const processPendingEarnings = async () => {
    console.log('[Cron Job] Running processPendingEarnings...');
    const db = getDB();
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [earningsToClear] = await connection.execute(
            `SELECT * FROM artist_earnings 
             WHERE status = 'pending_clearance' 
             AND created_at <= NOW() - INTERVAL ? DAY`,
            [CLEARANCE_DAYS]
        );

        if (earningsToClear.length === 0) {
            console.log('[Cron Job] No earnings to clear at this time.');
            await connection.commit();
            return;
        }

        console.log(`[Cron Job] Found ${earningsToClear.length} earning(s) to clear.`);

        for (const earning of earningsToClear) {
            await connection.execute(
                "UPDATE artist_earnings SET status = 'cleared' WHERE id = ?",
                [earning.id]
            );

            // Notify the artist that their funds are now available
            await createNotification(
                earning.artist_id,
                `Your earning of ₱${earning.net_amount} has been cleared and is now available for withdrawal.`,
                '/artist/dashboard?tab=earnings'
            );
        }

        await connection.commit();
        console.log(`[Cron Job] Successfully cleared ${earningsToClear.length} earning(s).`);

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('[Cron Job] Error processing pending earnings:', error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    processPendingEarnings,
};
