const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const crypto = require('crypto');
const cron = require('node-cron');
const { processEndedAuctions } = require('./services/auctionProcessor');
const { processPendingEarnings } = require('./services/earningsProcessor');

const http = require('http');
const { Server } = require('socket.io');

const config = require('./config');
const { connectDB, getDB } = require('./config/db');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { initializeSocket, createNotification } = require('./socketManager');

const app = express();
const server = http.createServer(app);
// Increase server timeouts to handle large file uploads
server.headersTimeout = 120 * 1000; // 2 minutes
server.requestTimeout = 120 * 1000; // 2 minutes
server.timeout = 300 * 1000; // 5 minutes
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://young-jokes-lose.loca.lt'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initializeSocket(io);

// Connect to the database
connectDB();
console.log('Connected to MySQL database');

// --- Config Sanity Check ---
console.log('[Config Check] PayMongo secret key loaded:', !!config.paymongo.secretKey);
console.log('[Config Check] PayMongo webhook secret loaded:', !!config.paymongo.webhookSecret);
if (!config.paymongo.secretKey || !config.paymongo.webhookSecret) {
  console.error('[FATAL] PayMongo keys are missing. Shutting down.');
  process.exit(1);
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', // Fallback port
  'https://young-jokes-lose.loca.lt'
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Webhook endpoint for PayMongo
app.post('/api/webhooks/paymongo', express.raw({ type: 'application/json' }), async (req, res) => {
  const db = getDB();
    const rawSignature = req.headers['paymongo-signature'];
    const webhookSecret = config.paymongo.webhookSecret;
    const rawBody = req.body;

    // --- TEMP DEBUG: log headers and basic info (safe for dev) ---
    try {
      console.log('[Webhook] Incoming PayMongo webhook');
      console.log('[Webhook] Headers present:', Object.keys(req.headers || {}));
      console.log('[Webhook] paymongo-signature header:', rawSignature || '(missing)');
      console.log('[Webhook] Raw body length:', rawBody ? rawBody.length : 0);
    } catch (e) {
      // ignore logging errors
    }

    if (!rawSignature || !webhookSecret) {
        return res.status(400).send('Signature or webhook secret not found');
    }

    try {
        const parts = rawSignature.split(',').map(s => s.trim());
        const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
        const liveSignature = parts.find(p => p.startsWith('v1='))?.split('=')[1];
        const testSignature = parts.find(p => p.startsWith('te='))?.split('=')[1];

        const providedSig = liveSignature || testSignature;

        if (!timestamp || !providedSig) {
            console.error('[Webhook] Malformed signature header. Full header:', rawSignature);
            return res.status(400).send('Malformed signature header (missing t= or signature param)');
        }

        const dataToHash = Buffer.concat([
            Buffer.from(`${timestamp}.`, 'utf-8'),
            req.body
        ]);

        const computed = crypto
            .createHmac('sha256', webhookSecret)
            .update(dataToHash)
            .digest('hex');

        if (computed !== providedSig) {
            console.error('[Webhook] SIGNATURE MISMATCH!');
            console.error(`[Webhook]   Environment: ${testSignature ? 'TEST' : 'LIVE'}`);
            console.error(`[Webhook]   Timestamp: ${timestamp}`);
            console.error(`[Webhook]   PayMongo Signature: ${providedSig}`);
            console.error(`[Webhook]   Computed Signature: ${computed}`);
            return res.status(400).send('Signature mismatch');
        }

        console.log(`[Webhook] Signature verified successfully (${testSignature ? 'TEST' : 'LIVE'})`);

        const event = JSON.parse(rawBody.toString());
        
        console.log('[Webhook] Event received:', JSON.stringify(event, null, 2));

        // Handle the event
        // The outer event type is 'event', the specific event is in attributes.type
        const baseType = event?.data?.type;
        const innerType = event?.data?.attributes?.type;
        const isPaidEvent = baseType === 'event' && (innerType === 'link.payment.paid' || innerType === 'payment_link.paid');
        if (isPaidEvent) {
            const payment = event.data.attributes.data; // This is the 'link' object
            const linkId = payment.id; 

            console.log(`--- [Webhook] Payment succeeded for Link ID: ${linkId} ---`);
            console.log(`--- [Webhook] Payment Data:`, JSON.stringify(payment, null, 2));

            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                // --- CHECK FOR ARTWORK PURCHASE FIRST ---
                const [pendingRows] = await connection.execute(
                    'SELECT user_id, artwork_ids FROM pending_payments WHERE id = ?',
                    [linkId]
                );

                if (pendingRows.length > 0) {
                    // --- HANDLE DIGITAL ARTWORK PURCHASE ---
                    const { user_id, artwork_ids: artworkIdsJson } = pendingRows[0];
                    const artworkIds = JSON.parse(artworkIdsJson);
                    const uniqueArtworkIds = [...new Set(artworkIds)];

                    const placeholders = uniqueArtworkIds.map(() => '?').join(',');
                    const [artworks] = await connection.execute(
                        `SELECT id, user_id as artist_id, title, price FROM artworks WHERE id IN (${placeholders}) AND artwork_type = 'digital'`,
                        uniqueArtworkIds
                    );

                    const totalAmount = artworks.reduce((sum, art) => sum + parseFloat(art.price), 0);
                    // Digital art orders are completed immediately upon payment
                    const initialOrderStatus = 'completed';

                    const [orderResult] = await connection.execute(
                        'INSERT INTO orders (user_id, total_amount, paymongo_payment_intent_id, status) VALUES (?, ?, ?, ?)',
                        [user_id, totalAmount, linkId, initialOrderStatus]
                    );
                    const orderId = orderResult.insertId;

                    for (const art of artworks) {
                        await connection.execute(
                            'INSERT INTO order_items (order_id, artwork_id, price, title) VALUES (?, ?, ?, ?)',
                            [orderId, art.id, art.price, art.title]
                        );

                        if (art.artwork_type === 'digital') {
                            await connection.execute(
                                'INSERT INTO digital_asset_access (user_id, artwork_id) VALUES (?, ?)',
                                [user_id, art.id]
                            );
                        }

                        // Artist earnings logic for artwork sale
                        const platformFee = art.price * 0.15; // Example 15% fee
                        const netAmount = art.price - platformFee;
                        await connection.execute(
                            'INSERT INTO artist_earnings (artist_id, source_id, source_type, amount, platform_fee, net_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [art.artist_id, orderId, 'artwork_sale', art.price, platformFee, netAmount, 'pending_clearance']
                        );

                        await createNotification(
                            art.artist_id,
                            `Your artwork "${art.title}" has been sold!`,
                            `/artist/dashboard` 
                        );
                    }
                    
                    await connection.execute(`UPDATE artworks SET status = "sold" WHERE id IN (${placeholders})`, uniqueArtworkIds);
                    
                    const [cartRows] = await connection.execute('SELECT id FROM carts WHERE user_id = ?', [user_id]);
                    if (cartRows.length > 0) {
                        const cartId = cartRows[0].id;
                        await connection.execute(`DELETE FROM cart_items WHERE cart_id = ? AND artwork_id IN (${placeholders})`, [cartId, ...uniqueArtworkIds]);
                    }
                    
                    await connection.execute('DELETE FROM pending_payments WHERE id = ?', [linkId]);
                    
                } else {
                    // --- CHECK FOR COMMISSION PAYMENT ---
                    const [commissionPaymentRows] = await connection.execute(
                        'SELECT * FROM commission_payments WHERE id = ?',
                        [linkId]
                    );

                    if (commissionPaymentRows.length > 0) {
                        const paymentRecord = commissionPaymentRows[0];

                        // Update the commission payment status
                        await connection.execute('UPDATE commission_payments SET status = ? WHERE id = ?', ['paid', linkId]);

                        // Simple completion - no milestone complexity
                        if (paymentRecord.project_id) {
                            // Mark project as completed
                            await connection.execute(
                                'UPDATE projects SET status = ? WHERE id = ?',
                                ['completed', paymentRecord.project_id]
                            );

                            // Get project details to find the artist and commission title
                            const [projectRows] = await connection.execute(
                                `SELECT p.artist_id, c.title
                                 FROM projects p
                                 JOIN commissions c ON p.commission_id = c.id
                                 WHERE p.id = ?`,
                                [paymentRecord.project_id]
                            );
                            const project = projectRows[0];

                            // Record artist earnings for commission completion
                            const platformFee = paymentRecord.amount * 0.15; // Example 15% fee
                            const netAmount = paymentRecord.amount - platformFee;
                            await connection.execute(
                                'INSERT INTO artist_earnings (artist_id, source_id, source_type, amount, platform_fee, net_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                                [project.artist_id, paymentRecord.project_id, 'commission_completion', paymentRecord.amount, platformFee, netAmount, 'pending_clearance']
                            );

                            // Create notification for the artist
                            await createNotification(
                                project.artist_id,
                                `You have received payment for the completed project: "${project.title}"`,
                                `/project/${paymentRecord.project_id}`
                            );
                        }
                    } else {
                        console.warn(`--- [Webhook] Warning: No pending payment found for Link ID: ${linkId}. Might be a duplicate or old event.`);
                        // Still return 200 to acknowledge receipt and prevent retries
                    }
                }

                await connection.commit();
                console.log(`--- [Webhook] Successfully processed payment for Link ID: ${linkId} ---`);

            } catch (dbError) {
                await connection.rollback();
                console.error('--- [Webhook] Database transaction error ---', dbError);
                return res.status(500).send('Internal server error during order processing.');
            } finally {
                if (connection) connection.release();
            }
        }

        res.status(200).send('Event received');

    } catch (err) {
        console.error('--- [Webhook] UNEXPECTED ERROR during manual verification ---', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: config.nodeEnv === 'production' },
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API Routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`ArtisTech API server running on port ${PORT}`);
  
  // Schedule the auction processing task to run every minute
  cron.schedule('* * * * *', () => {
    processEndedAuctions();
  });

  // Schedule the earnings clearance task to run once a day at midnight
  cron.schedule('0 0 * * *', () => {
    processPendingEarnings();
  });
});

module.exports = app;

