const { getDB } = require('../config/db');

// Get all listings for the authenticated artist
exports.getMyListings = async (req, res) => {
    const db = getDB();
    const artistId = req.user.userId;
    try {
        const [listings] = await db.query(
            'SELECT * FROM commission_listings WHERE artist_id = ? ORDER BY created_at DESC',
            [artistId]
        );
        res.json(listings);
    } catch (error) {
        console.error(`Error fetching listings for artist ${artistId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all listings for a specific artist
exports.getArtistListings = async (req, res) => {
    const db = getDB();
    const { artistId } = req.params;
    try {
        const [listings] = await db.query(
            'SELECT * FROM commission_listings WHERE artist_id = ? AND status != "archived" ORDER BY created_at DESC',
            [artistId]
        );
        res.json(listings);
    } catch (error) {
        console.error(`Error fetching listings for artist ${artistId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a single commission listing by its ID
exports.getListingById = async (req, res) => {
    const db = getDB();
    const { id } = req.params;
    try {
        const [listings] = await db.query('SELECT * FROM commission_listings WHERE id = ?', [id]);
        if (listings.length === 0) {
            return res.status(404).json({ error: 'Commission listing not found.' });
        }
        res.json(listings[0]);
    } catch (error) {
        console.error(`Error fetching listing ${id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new commission listing
exports.createListing = async (req, res) => {
    const db = getDB();
    const artistId = req.user.userId;
    const { title, description, pricing_model, pricing_details, revisions_policy, turnaround_time, tags } = req.body;

    // Basic validation
    if (!title || !pricing_model || !pricing_details) {
        return res.status(400).json({ error: 'Title, pricing model, and pricing details are required.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO commission_listings (artist_id, title, description, pricing_model, pricing_details, revisions_policy, turnaround_time, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [artistId, title, description, pricing_model, JSON.stringify(pricing_details), revisions_policy, turnaround_time, tags]
        );
        res.status(201).json({ message: 'Commission listing created successfully.', listingId: result.insertId });
    } catch (error) {
        console.error(`Error creating listing for artist ${artistId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update an existing commission listing
exports.updateListing = async (req, res) => {
    const db = getDB();
    const { id } = req.params;
    const artistId = req.user.userId;
    const { title, description, pricing_model, pricing_details, revisions_policy, turnaround_time, status, tags } = req.body;

    try {
        const [listings] = await db.query('SELECT artist_id FROM commission_listings WHERE id = ?', [id]);
        if (listings.length === 0) {
            return res.status(404).json({ error: 'Listing not found.' });
        }
        if (listings[0].artist_id !== artistId) {
            return res.status(403).json({ error: 'You are not authorized to update this listing.' });
        }

        await db.query(
            'UPDATE commission_listings SET title = ?, description = ?, pricing_model = ?, pricing_details = ?, revisions_policy = ?, turnaround_time = ?, status = ?, tags = ? WHERE id = ?',
            [title, description, pricing_model, JSON.stringify(pricing_details), revisions_policy, turnaround_time, status, tags, id]
        );

        res.json({ message: 'Listing updated successfully.' });
    } catch (error) {
        console.error(`Error updating listing ${id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update listing status (toggle active/inactive)
exports.updateListingStatus = async (req, res) => {
    const db = getDB();
    const { id } = req.params;
    const artistId = req.user.userId;
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ error: 'Status must be either "active" or "inactive".' });
    }

    try {
        const [listings] = await db.query('SELECT artist_id FROM commission_listings WHERE id = ?', [id]);
        if (listings.length === 0) {
            return res.status(404).json({ error: 'Listing not found.' });
        }
        if (listings[0].artist_id !== artistId) {
            return res.status(403).json({ error: 'You are not authorized to update this listing.' });
        }

        await db.query('UPDATE commission_listings SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Listing status updated successfully.' });
    } catch (error) {
        console.error(`Error updating listing status ${id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Archive (soft delete) a commission listing
exports.deleteListing = async (req, res) => {
    const db = getDB();
    const { id } = req.params;
    const artistId = req.user.userId;

    try {
        const [listings] = await db.query('SELECT artist_id FROM commission_listings WHERE id = ?', [id]);
        if (listings.length === 0) {
            return res.status(404).json({ error: 'Listing not found.' });
        }
        if (listings[0].artist_id !== artistId) {
            return res.status(403).json({ error: 'You are not authorized to delete this listing.' });
        }

        await db.query('UPDATE commission_listings SET status = "archived" WHERE id = ?', [id]);
        res.status(200).json({ message: 'Listing archived successfully.' });

    } catch (error) {
        console.error(`Error deleting listing ${id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
