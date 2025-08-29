const Paymongo = require('paymongo-node');
const { getDB } = require('../config/db');
const config = require('../config');

const paymongo = new Paymongo(config.paymongo.secretKey);

/**
 * Creates a PayMongo payment link for a commission project.
 * @param {object} paymentDetails - The details for the payment.
 * @param {number} paymentDetails.amount - The amount to be paid.
 * @param {string} paymentDetails.description - The description for the payment link.
 * @param {string} paymentDetails.remarks - Remarks for the payment link.
 * @param {number} paymentDetails.userId - The ID of the user making the payment.
 * @param {number} paymentDetails.projectId - The ID of the project.
 * @returns {Promise<object>} The created PayMongo link object.
 */
const createCommissionPaymentLink = async ({ amount, description, remarks, userId, projectId }) => {
    const db = getDB();

    if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount.');
    }

    // PayMongo minimum amount is ₱100.00
    if (Number(amount) < 100) {
        throw new Error('Minimum payment amount is ₱100. Please adjust the project amount and try again.');
    }

    const link = await paymongo.links.create({
        amount: parseInt(amount * 100),
        description: description,
        remarks: remarks,
        success_url: `${config.frontendUrl}/payment-success?type=commission&projectId=${projectId}`,
        fail_url: `${config.frontendUrl}/payment-fail`,
    });

    await db.query(
        'INSERT INTO commission_payments (id, user_id, project_id, amount, status) VALUES (?, ?, ?, ?, ?)',
        [link.id, userId, projectId, amount, 'pending']
    );

    return {
        checkout_url: link.checkout_url,
        link_id: link.id,
    };
};

module.exports = {
    createCommissionPaymentLink,
};
