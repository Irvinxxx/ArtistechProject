const Paymongo = require('paymongo-node');
const { getDB } = require('../config/db');
const config = require('../config');
const paymentService = require('../services/paymentService');

const paymongo = new Paymongo(config.paymongo.secretKey);

const createPaymentLink = async (req, res) => {
  const db = getDB();
  let connection;
  try {
    const { selectedArtworkIds } = req.body;
    const userId = req.user.userId;

    if (!selectedArtworkIds || selectedArtworkIds.length === 0) {
      return res.status(400).json({ error: 'No artworks selected for checkout.' });
    }

    connection = await db.getConnection();

    const placeholders = selectedArtworkIds.map(() => '?').join(',');
    const [artworks] = await connection.execute(
      `SELECT id, title, price FROM artworks WHERE id IN (${placeholders}) AND artwork_type = 'digital'`,
      selectedArtworkIds
    );

    if (artworks.length !== selectedArtworkIds.length) {
      throw new Error('One or more digital artworks not found.');
    }

    const totalAmount = artworks.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const description = `ArtisTech Digital Art purchase for user ${userId}`;

    const link = await paymongo.links.create({
      amount: parseInt(totalAmount * 100),
      description: description,
      remarks: `Digital Art Link for ${userId} - ${new Date().toISOString()}`,
      success_url: `${config.frontendUrl}/order-confirmation`,
      fail_url: `${config.frontendUrl}/payment-fail`,
    });

    await db.execute(
      'INSERT INTO pending_payments (id, user_id, artwork_ids) VALUES (?, ?, ?)',
      [link.id, userId, JSON.stringify(selectedArtworkIds)]
    );

    res.json({
      message: 'Payment link created successfully.',
      checkout_url: link.checkout_url,
      link_id: link.id,
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: 'Failed to create payment link.', details: error.response?.data?.errors || error.message });
  } finally {
    if (connection) connection.release();
  }
};

const createCommissionPaymentLink = async (req, res) => {
  const db = getDB();
  try {
    const { projectId, milestoneId } = req.body;
    const userId = req.user.userId;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    // --- Simplified: Final payment for completed project ---
    const [projectRows] = await db.query(
        `SELECT p.final_price, c.title, p.status, p.client_id
         FROM projects p
         JOIN commissions c ON p.commission_id = c.id
         WHERE p.id = ?`,
        [projectId]
    );

    if (projectRows.length === 0) {
        return res.status(404).json({ error: 'Project not found.' });
    }

    const project = projectRows[0];

    // Only clients can pay for projects
    if (project.client_id !== userId) {
        return res.status(403).json({ error: 'Access denied. Only the client can make payments.' });
    }

    // Only allow payment when project is ready for client approval
    if (project.status !== 'pending_client_approval') {
        return res.status(400).json({
            error: 'Payment not available. Project must be pending client approval.'
        });
    }

    const amount = project.final_price;
    const description = `Final payment for completed project: "${project.title}"`;

    const paymentLinkDetails = await paymentService.createCommissionPaymentLink({
      amount,
      description,
      remarks: `Final payment for user ${userId} - Project ${projectId}`,
      userId,
      projectId,
      milestoneId: null, // No milestone payments in simplified system
    });

    res.json({
      message: 'Commission payment link created successfully.',
      ...paymentLinkDetails,
    });

  } catch (error) {
    console.error('Error creating commission payment link:', error);
    res.status(500).json({ error: 'Failed to create commission payment link.', details: error.message });
  }
};

const getArtworkPaymentStatus = async (req, res) => {
  const db = getDB();
  try {
    const { linkId } = req.params;
    const userId = req.user.userId;

    if (!linkId) {
      return res.status(400).json({ error: 'Link ID is required.' });
    }

    const [pendingRows] = await db.execute(
      'SELECT * FROM pending_payments WHERE id = ? AND user_id = ?',
      [linkId, userId]
    );

    if (pendingRows.length > 0) {
      return res.json({ status: 'pending' });
    }

    const [orderRows] = await db.execute(
      'SELECT id FROM orders WHERE paymongo_payment_intent_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
      [linkId, userId]
    );

    if (orderRows.length > 0) {
      res.json({ status: 'completed', orderId: orderRows[0].id });
    } else {
      res.json({ status: 'pending' });
    }
  } catch (error) {
    console.error('Error checking pending payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPaymentLink,
  createCommissionPaymentLink,
  getArtworkPaymentStatus,
}; 