const { getDB } = require('../config/db');

const getOrderHistory = async (req, res) => {
  try {
    const db = getDB();
    // Step 1: Fetch a flat list of all order items, including order details.
    const [rows] = await db.execute(`
      SELECT 
        o.id as order_id,
        o.status,
        o.total_amount,
        o.shipping_carrier,
        o.tracking_number,
        o.created_at as order_date,
        oi.id as order_item_id,
        a.id as artwork_id,
        oi.title,
        oi.price,
        a.thumbnail_image,
        a.artwork_type,
        u_artist.name as artist_name,
        u_artist.id as artist_id,
        CASE WHEN r.id IS NOT NULL THEN TRUE ELSE FALSE END as reviewed
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN artworks a ON oi.artwork_id = a.id
      JOIN users u_artist ON a.user_id = u_artist.id
      LEFT JOIN reviews r ON r.artwork_id = a.id AND r.reviewer_id = o.user_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC, o.id DESC
    `, [req.user.userId]);

    // Step 2: Group the flat list into the desired nested structure in JavaScript.
    const ordersMap = new Map();
    for (const row of rows) {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          id: row.order_id,
          status: row.status,
          total_amount: row.total_amount,
          shipping_carrier: row.shipping_carrier,
          tracking_number: row.tracking_number,
          order_date: row.order_date,
          items: [],
        });
      }
      
      ordersMap.get(row.order_id).items.push({
        order_item_id: row.order_item_id,
        artwork_id: row.artwork_id,
        title: row.title,
        price: row.price,
        thumbnail_image: row.thumbnail_image,
        artwork_type: row.artwork_type,
        artist_name: row.artist_name,
        artist_id: row.artist_id,
        reviewed: !!row.reviewed,
      });
    }

    const groupedOrders = Array.from(ordersMap.values());

    res.json(groupedOrders);
  } catch (error) {
    console.error('Failed to fetch order history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getOrdersForArtist = async (req, res) => {
  try {
    const db = getDB();
    const artistId = req.user.userId;
    const [orders] = await db.execute(`
      SELECT 
        o.id,
        oi.title,
        oi.price,
        a.thumbnail_image,
        a.original_image,
        o.status,
        o.created_at as order_date,
        u.name as buyer_name,
        ad.full_name as recipient_name,
        ad.phone_number,
        ad.street_address,
        ad.city,
        ad.province,
        ad.postal_code,
        ad.country,
        ad.landmark
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN artworks a ON oi.artwork_id = a.id
      JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses ad ON u.id = ad.user_id AND ad.is_default = 1
      WHERE a.user_id = ? AND o.status = 'processing' AND a.artwork_type = 'physical'
      ORDER BY o.created_at ASC
    `, [artistId]);
    res.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders for artist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const markOrderAsShipped = async (req, res) => {
  try {
    const db = getDB();
    const { orderId } = req.params;
    const { shippingCarrier, trackingNumber } = req.body;

    if (!shippingCarrier || !trackingNumber) {
      return res.status(400).json({ error: 'Shipping carrier and tracking number are required.' });
    }

    await db.execute(
      'UPDATE orders SET status = "shipped", shipping_carrier = ?, tracking_number = ? WHERE id = ?',
      [shippingCarrier, trackingNumber, orderId]
    );

    res.json({ message: 'Order marked as shipped.' });
  } catch (error) {
    console.error('Failed to mark order as shipped:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getSalesHistoryForArtist = async (req, res) => {
  try {
    const db = getDB();
    const artistId = req.user.userId;
    const [sales] = await db.execute(`
      SELECT
        o.id,
        oi.title,
        oi.price,
        o.status,
        o.created_at as purchase_date,
        o.updated_at as completion_date,
        u.name as buyer_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN artworks a ON oi.artwork_id = a.id
      JOIN users u ON o.user_id = u.id
      WHERE a.user_id = ? AND o.status = 'completed'
      ORDER BY o.created_at DESC
    `, [artistId]);
    res.json(sales);
  } catch (error) {
    console.error('Failed to fetch sales history for artist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getOrderHistory,
  getOrdersForArtist,
  markOrderAsShipped,
  getSalesHistoryForArtist,
}; 