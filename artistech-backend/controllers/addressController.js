const { getDB } = require('../config/db');

const getAddresses = async (req, res) => {
  try {
    const db = getDB();
    const [addresses] = await db.execute('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [req.user.userId]);
    res.json(addresses);
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addAddress = async (req, res) => {
  const { fullName, phoneNumber, streetAddress, city, province, postalCode, country, landmark, isDefault } = req.body;
  const userId = req.user.userId;
  const db = getDB();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // If setting a new default, first unset any existing default
    if (isDefault) {
      await connection.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const [result] = await connection.execute(`
      INSERT INTO addresses (user_id, full_name, phone_number, street_address, city, province, postal_code, country, landmark, is_default) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, fullName, phoneNumber, streetAddress, city, province, postalCode, country, landmark, isDefault ? 1 : 0]
    );

    await connection.commit();
    res.status(201).json({ id: result.insertId, message: 'Address added successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to add address:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

const updateAddress = async (req, res) => {
  const { id } = req.params;
  const { fullName, phoneNumber, streetAddress, city, province, postalCode, country, landmark, isDefault } = req.body;
  const userId = req.user.userId;
  const db = getDB();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // If setting a new default, first unset any existing default
    if (isDefault) {
      await connection.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const [result] = await connection.execute(`
      UPDATE addresses 
      SET full_name = ?, phone_number = ?, street_address = ?, city = ?, province = ?, postal_code = ?, country = ?, landmark = ?, is_default = ?
      WHERE id = ? AND user_id = ?`,
      [fullName, phoneNumber, streetAddress, city, province, postalCode, country, landmark, isDefault ? 1 : 0, id, userId]
    );
    
    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Address not found or user not authorized.' });
    }

    res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to update address:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  try {
    const db = getDB();
    const [result] = await db.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Address not found or user not authorized.' });
    }

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Failed to delete address:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const setDefaultAddress = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const db = getDB();
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        // Unset current default
        await connection.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
        // Set new default
        const [result] = await connection.execute('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [id, userId]);
        await connection.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Address not found or user not authorized.' });
        }

        res.status(200).json({ message: 'Default address updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Failed to set default address:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};


module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
}; 