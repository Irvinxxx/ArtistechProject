const { getDB } = require('../config/db');
const { createAndEmitNotification } = require('../utils/createNotification');

// Client creates a new commission request for an artist
exports.createCommissionRequest = async (req, res) => {
    const db = getDB();
    const clientId = req.user.userId;
    const { artist_id, source_listing_id, title, description, budget_min, budget_max, deadline, requirements } = req.body;
    const reference_images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    if (!artist_id || !title || !description) {
        return res.status(400).json({ error: 'Artist, title, and description are required.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO commissions (client_id, artist_id, source_listing_id, title, description, budget_min, budget_max, deadline, requirements, status, reference_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [clientId, artist_id, source_listing_id || null, title, description, budget_min, budget_max, deadline, requirements, 'awaiting_proposal', JSON.stringify(reference_images)]
        );
        res.status(201).json({ message: 'Commission request sent successfully.', commissionId: result.insertId });
    } catch (error) {
        console.error('Error creating commission request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Client creates a public commission request (open to all artists)
exports.createPublicCommissionRequest = async (req, res) => {
    const db = getDB();
    const clientId = req.user.userId;
    const { title, description, budget_min, budget_max, deadline, requirements } = req.body;
    const reference_images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO commissions (client_id, artist_id, title, description, budget_min, budget_max, deadline, requirements, status, reference_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [clientId, null, title, description, budget_min, budget_max, deadline, requirements, 'open', JSON.stringify(reference_images)]
        );
        
        res.status(201).json({ 
            message: 'Public commission request posted successfully.', 
            commissionId: result.insertId 
        });
    } catch (error) {
        console.error('Error creating public commission request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Artist creates a proposal for a commission request
exports.createProposal = async (req, res) => {
    const db = getDB();
    const artistId = req.user.userId;
    const { commission_id, proposal_text, proposed_price, estimated_completion } = req.body;

    // --- DEBUGGING ---
    console.log('[DEBUG] createProposal called');
    console.log('[DEBUG] artistId:', artistId);
    console.log('[DEBUG] req.body:', JSON.stringify(req.body, null, 2));
    // --- END DEBUGGING ---


    if (!commission_id || !proposal_text || proposed_price === undefined || proposed_price === null) {
        return res.status(400).json({ error: 'Commission ID, proposal text, and price are required.' });
    }
    // Enforce platform minimum (₱100.00) early to avoid downstream payment errors
    const numericPrice = Number(proposed_price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Proposed price must be a valid positive number.' });
    }
    if (numericPrice < 100) {
        return res.status(400).json({ error: 'Minimum proposal price is ₱100. Please increase your price.' });
    }

    try {
        // Check if this is a valid commission for proposal submission
        const [commissions] = await db.query(
            'SELECT id, client_id, artist_id, status FROM commissions WHERE id = ?', 
            [commission_id]
        );
        
        if (commissions.length === 0) {
            return res.status(404).json({ error: 'Commission not found.' });
        }

        const commission = commissions[0];

        // Verify artist can submit proposal
        if (commission.status === 'awaiting_proposal' && commission.artist_id !== artistId) {
            return res.status(403).json({ error: 'This commission is not for you.' });
        } else if (commission.status !== 'open' && commission.status !== 'awaiting_proposal') {
            return res.status(400).json({ error: 'This commission is not accepting proposals.' });
        }

        // Check if artist already submitted a proposal
        const [existingProposals] = await db.query(
            'SELECT id FROM commission_proposals WHERE commission_id = ? AND artist_id = ?',
            [commission_id, artistId]
        );

        if (existingProposals.length > 0) {
            return res.status(400).json({ error: 'You have already submitted a proposal for this commission.' });
        }

        const [result] = await db.query(
            'INSERT INTO commission_proposals (commission_id, artist_id, proposal_text, proposed_price, estimated_completion) VALUES (?, ?, ?, ?, ?)',
            [commission_id, artistId, proposal_text, numericPrice, estimated_completion]
        );

        // Send notification to the client who posted the commission
        const [commissionDetails] = await db.execute('SELECT title, client_id FROM commissions WHERE id = ?', [commission_id]);
        if (commissionDetails.length > 0) {
            const commissionTitle = commissionDetails[0].title;
            const clientId = commissionDetails[0].client_id;
            const [artist] = await db.execute('SELECT name FROM users WHERE id = ?', [artistId]);
            const artistName = artist.length > 0 ? artist[0].name : 'An artist';
            
            await createAndEmitNotification(
                clientId,
                `${artistName} has submitted a proposal for your commission: "${commissionTitle}"`,
                `/commissions/${commission_id}/proposals`
            );
        }

        res.status(201).json({ message: 'Proposal sent successfully.', proposalId: result.insertId });
    } catch (error) {
        console.error('Error creating proposal:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all proposals for a specific commission
exports.getProposalsForCommission = async (req, res) => {
    const db = getDB();
    const clientId = req.user.userId;
    const { commissionId } = req.params;

    try {
        // First, verify the user is the client for this commission
        const [commissions] = await db.query('SELECT client_id FROM commissions WHERE id = ?', [commissionId]);
        if (commissions.length === 0 || commissions[0].client_id !== clientId) {
            return res.status(403).json({ error: 'You are not authorized to view proposals for this commission.' });
        }

        // Fetch all proposals for the commission, joining with artist details
        const [proposals] = await db.query(
            `SELECT p.*, u.name as artist_name, u.profile_image as artist_profile_image
             FROM commission_proposals p
             JOIN users u ON p.artist_id = u.id
             WHERE p.commission_id = ?`,
            [commissionId]
        );

        res.json(proposals);
    } catch (error) {
        console.error(`Error fetching proposals for commission ${commissionId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a single commission by ID
exports.getCommissionById = async (req, res) => {
    const db = getDB();
    const userId = req.user.userId;
    const { commissionId } = req.params;

    try {
        // First get the commission details
        const [commissions] = await db.query(
             `SELECT c.*, client.name as client_name, artist.name as artist_name 
              FROM commissions c
              JOIN users client ON c.client_id = client.id
              LEFT JOIN users artist ON c.artist_id = artist.id
              WHERE c.id = ?`,
            [commissionId]
        );

        if (commissions.length === 0) {
            return res.status(404).json({ error: 'Commission not found.' });
        }

        const commission = commissions[0];

        // Authorization check:
        // - Commission details are viewable by:
        //   1. The client who posted it (for reviewing proposals)
        //   2. The assigned artist (for direct commissions)
        //   3. Public commissions are viewable in browse page, but proposal review is client-only
        const isClientOwner = commission.client_id === userId;
        const isAssignedArtist = commission.artist_id === userId;
        
        if (!isClientOwner && !isAssignedArtist) {
            return res.status(403).json({ error: 'You are not authorized to view this commission.' });
        }
        
        res.json(commission);
    } catch (error) {
        console.error(`Error fetching commission ${commissionId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Client accepts a proposal
exports.acceptProposal = async (req, res) => {
    const clientId = req.user.userId;
    const { proposalId } = req.params;

    const connection = await getDB().getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update the accepted proposal's status
        await connection.execute('UPDATE commission_proposals SET status = ? WHERE id = ?', ['accepted', proposalId]);

        // 2. Update the commission itself to link the accepted proposal and change status
        const [proposalRows] = await connection.execute('SELECT commission_id, artist_id, proposed_price FROM commission_proposals WHERE id = ?', [proposalId]);
        if (proposalRows.length === 0) throw new Error('Proposal not found');
        const { commission_id, artist_id, proposed_price } = proposalRows[0];
        
        await connection.execute(
            'UPDATE commissions SET artist_id = ?, status = ?, accepted_proposal_id = ? WHERE id = ?',
            [artist_id, 'in_progress', proposalId, commission_id]
        );

        // 3. Reject all other proposals for the same commission
        await connection.execute(
            'UPDATE commission_proposals SET status = ? WHERE commission_id = ? AND id != ?',
            ['rejected', commission_id, proposalId]
        );

        // 4. Create the project
        const [projectResult] = await connection.execute(
            'INSERT INTO projects (commission_id, client_id, artist_id, final_price, status) VALUES (?, ?, ?, ?, ?)',
            [commission_id, req.user.userId, artist_id, proposed_price, 'awaiting_payment']
        );
        const projectId = projectResult.insertId;

        // --- NOTIFICATIONS ---
        // Notify the accepted artist
        await createAndEmitNotification(
            artist_id,
            `Your proposal for a commission has been accepted!`,
            `/project/${projectId}`
        );
        
        // Notify rejected artists
        const [rejectedProposals] = await connection.execute('SELECT artist_id FROM commission_proposals WHERE commission_id = ? AND status = ?', [commission_id, 'rejected']);
        for (const rejected of rejectedProposals) {
            await createAndEmitNotification(
                rejected.artist_id,
                `A decision has been made on a commission you applied for.`,
                `/my-dashboard` // A generic link
            );
        }
        // --- END NOTIFICATIONS ---

        await connection.commit();
        res.status(200).json({ message: 'Proposal accepted and project created.', projectId });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error accepting proposal:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        connection.release();
    }
};

// Browse public commission requests (for artists to discover work)
exports.browseCommissions = async (req, res) => {
    const db = getDB();
    const { 
        page = 1, 
        limit = 20, 
        budget_min, 
        budget_max, 
        skills, 
        sort = 'newest',
        search 
    } = req.query;

    try {
        const offset = (page - 1) * limit;
        let whereClause = "WHERE c.status = 'open'";
        let queryParams = [];

        // Budget filters
        if (budget_min) {
            whereClause += " AND (c.budget_min >= ? OR c.budget_min IS NULL)";
            queryParams.push(parseFloat(budget_min));
        }
        if (budget_max) {
            whereClause += " AND (c.budget_max <= ? OR c.budget_max IS NULL)";
            queryParams.push(parseFloat(budget_max));
        }

        // Search filter
        if (search) {
            whereClause += " AND (c.title LIKE ? OR c.description LIKE ? OR c.requirements LIKE ?)";
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        // Sorting
        let orderBy = "ORDER BY c.created_at DESC";
        if (sort === 'budget_high') {
            orderBy = "ORDER BY c.budget_max DESC, c.budget_min DESC";
        } else if (sort === 'budget_low') {
            orderBy = "ORDER BY c.budget_min ASC, c.budget_max ASC";
        } else if (sort === 'deadline') {
            orderBy = "ORDER BY c.deadline ASC";
        }

        // Main query to get commissions with client info
        const query = `
            SELECT 
                c.id,
                c.title,
                c.description,
                c.budget_min,
                c.budget_max,
                c.deadline,
                c.requirements,
                c.reference_images,
                c.created_at,
                u.name as client_name,
                u.profile_image as client_profile_image,
                (SELECT COUNT(*) FROM commission_proposals WHERE commission_id = c.id) as proposal_count
            FROM commissions c
            JOIN users u ON c.client_id = u.id
            ${whereClause}
            ${orderBy}
            LIMIT ? OFFSET ?
        `;

        queryParams.push(parseInt(limit), offset);

        const [commissions] = await db.execute(query, queryParams);

        // Count total for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM commissions c
            JOIN users u ON c.client_id = u.id
            ${whereClause}
        `;

        const [countResult] = await db.execute(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
        const total = countResult[0].total;

        // Parse reference_images JSON for each commission
        const commissionsWithImages = commissions.map(commission => ({
            ...commission,
            reference_images: commission.reference_images ? JSON.parse(commission.reference_images) : []
        }));

        res.json({
            commissions: commissionsWithImages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error browsing commissions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get commissions for the logged-in user (both as client and artist)
exports.getMyCommissions = async (req, res) => {
    const db = getDB();
    const userId = req.user.userId;
    try {
        const [commissions] = await db.query(
            `SELECT 
                c.*, 
                client.name as client_name, 
                artist.name as artist_name,
                (SELECT COUNT(*) FROM commission_proposals WHERE commission_id = c.id) as proposal_count,
                p.id as project_id,
                p.status as project_status
             FROM commissions c
             JOIN users client ON c.client_id = client.id
             LEFT JOIN users artist ON c.artist_id = artist.id
             LEFT JOIN projects p ON c.id = p.commission_id
             WHERE c.client_id = ? OR c.artist_id = ?
             ORDER BY c.updated_at DESC`,
            [userId, userId]
        );
        res.json(commissions);
    } catch (error) {
        console.error(`Error fetching commissions for user ${userId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
