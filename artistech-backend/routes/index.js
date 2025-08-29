const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const artworkRoutes = require('./artworks');
const auctionRoutes = require('./auctions');
const cartRoutes = require('./cart');
const checkoutRoutes = require('./checkout');
const artistRoutes = require('./artists');
const wishlistRoutes = require('./wishlist');
const userRoutes = require('./user');
const reviewRoutes = require('./reviews');
const orderRoutes = require('./orders');
const addressRoutes = require('./address');
const messageRoutes = require('./messages');
const notificationRoutes = require('./notifications');
const skillRoutes = require('./skills');
const commissionListingRoutes = require('./commissionListings');
const commissionRoutes = require('./commissions');
const projectUpdateRoutes = require('./projectUpdates');


router.use('/auth', authRoutes);
router.use('/artworks', artworkRoutes);
router.use('/auctions', auctionRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/artists', artistRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/user', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/orders', orderRoutes);
router.use('/address', addressRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/skills', skillRoutes);
router.use('/commission-listings', commissionListingRoutes);
router.use('/commissions', commissionRoutes);
router.use('/project-updates', projectUpdateRoutes);


module.exports = router; 