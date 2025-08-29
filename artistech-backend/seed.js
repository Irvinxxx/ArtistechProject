const { faker } = require('@faker-js/faker');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const ARTISTS_TO_CREATE = 10;
const NUM_CLIENTS = 10;
// const BIDS_PER_AUCTION = 5; // Bidding logic will be removed

async function seedDatabase() {
  let db;
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'artistech_db',
      multipleStatements: true
    });
    console.log('Connected to the database.');

    console.log('Clearing existing data...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');
    await db.query('TRUNCATE TABLE bids; TRUNCATE TABLE auctions; TRUNCATE TABLE artworks; TRUNCATE TABLE follows; TRUNCATE TABLE users; TRUNCATE TABLE carts; TRUNCATE TABLE cart_items;');
    await db.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('Creating users...');
    const users = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (let i = 0; i < ARTISTS_TO_CREATE; i++) {
      const user = {
        email: faker.internet.email(),
        password_hash: hashedPassword,
        name: faker.person.fullName(),
        user_type: 'artist',
        bio: faker.lorem.paragraph(),
        verified: true,
        profile_image: faker.image.avatar(),
        location: `${faker.location.city()}, Philippines`,
      };
      const [result] = await db.execute('INSERT INTO users (email, password_hash, name, user_type, bio, verified, profile_image, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', Object.values(user));
      users.push({ ...user, id: result.insertId });
    }

    for (let i = 0; i < NUM_CLIENTS; i++) {
      const user = {
        email: faker.internet.email(),
        password_hash: hashedPassword,
        name: faker.person.fullName(),
        user_type: 'client',
        bio: faker.lorem.paragraph(),
        verified: true,
        profile_image: faker.image.avatar(),
        location: `${faker.location.city()}, Philippines`,
      };
      const [result] = await db.execute('INSERT INTO users (email, password_hash, name, user_type, bio, verified, profile_image, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', Object.values(user));
      users.push({ ...user, id: result.insertId });
    }

    const artists = users.filter(u => u.user_type === 'artist');
    const clients = users.filter(u => u.user_type === 'client');

    console.log('Creating artworks...');
    const [categories] = await db.execute('SELECT id FROM categories');
    const artworks = [];
    
    // Use more reliable Unsplash images for digital art
    const artworkTitles = [
      'Digital Portrait Study', 'Abstract Digital Composition', 'Cyberpunk Character Design',
      'Digital Landscape Painting', 'Modern UI Interface Design', 'Fantasy Character Art',
      'Digital Still Life', 'Concept Art Environment', 'Logo Design Project',
      'Digital Illustration Series', 'Game Asset Design', 'Motion Graphics Frame',
      'Digital Photo Manipulation', 'Vector Art Design', 'NFT Character Design'
    ];

    // Get existing uploaded files
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    let uploadedFiles = [];
    
    try {
      uploadedFiles = fs.readdirSync(uploadsDir)
        .filter(file => file.startsWith('artwork-') && !file.startsWith('watermarked-'))
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    } catch (error) {
      console.log('No uploads directory found, using placeholders only');
    }

    for (let i = 0; i < ARTISTS_TO_CREATE * 3; i++) {
      // Mix of placeholder URLs and real uploaded files
      let originalImage, thumbnailImage;
      
      if (uploadedFiles.length > 0 && i % 3 === 0) {
        // Every 3rd artwork uses a real uploaded file
        const randomFile = faker.helpers.arrayElement(uploadedFiles);
        originalImage = `/uploads/${randomFile}`;
        thumbnailImage = `/uploads/${randomFile}`;
      } else {
        // Use static placeholder images (consistent across page loads)
        const imageId = (i % 50) + 100; // Use consistent image IDs (100-149)
        originalImage = `https://picsum.photos/id/${imageId}/800/600`;
        thumbnailImage = `https://picsum.photos/id/${imageId}/400/300`;
      }

      const artwork = {
        user_id: faker.helpers.arrayElement(artists).id,
        category_id: faker.helpers.arrayElement(categories).id,
        title: faker.helpers.arrayElement(artworkTitles),
        description: faker.lorem.sentences(2) + ' Created using digital art techniques and modern software tools.',
        price: faker.commerce.price({ min: 500, max: 25000, dec: 0 }),
        original_image: originalImage,
        thumbnail_image: thumbnailImage,
        status: 'published',
        artwork_type: 'digital',
        views: faker.number.int({ min: 10, max: 500 }),
        likes: faker.number.int({ min: 5, max: 100 }),
        is_portfolio_piece: 1
      };
        
        const [result] = await db.execute(
          'INSERT INTO artworks (user_id, category_id, title, description, price, original_image, thumbnail_image, status, artwork_type, views, likes, is_portfolio_piece) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [artwork.user_id, artwork.category_id, artwork.title, artwork.description, artwork.price, artwork.original_image, artwork.thumbnail_image, artwork.status, artwork.artwork_type, artwork.views, artwork.likes, artwork.is_portfolio_piece]
        );

        artworks.push({ ...artwork, id: result.insertId });
    }

    // console.log('Creating auctions and bids...');
    // const activeArtworks = faker.helpers.arrayElements(artworks, 3);
    // for (const artwork of activeArtworks) {
    //     const auction = {
    //         artwork_id: artwork.id,
    //         starting_bid: artwork.price * 0.8,
    //         current_bid: artwork.price * (1 + Math.random()),
    //         start_time: new Date(),
    //         end_time: faker.date.future(),
    //         status: 'active',
    //         total_bids: BIDS_PER_AUCTION,
    //     };
    //     const [result] = await db.execute('INSERT INTO auctions (artwork_id, starting_bid, current_bid, start_time, end_time, status, total_bids) VALUES (?, ?, ?, ?, ?, ?, ?)', Object.values(auction));
    //     const auctionId = result.insertId;

    //     for (let i = 0; i < BIDS_PER_AUCTION; i++) {
    //         const bid = {
    //             auction_id: auctionId,
    //             user_id: faker.helpers.arrayElement(clients).id,
    //             amount: auction.current_bid * (0.9 + (i * 0.02)),
    //         };
    //         await db.execute('INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)', Object.values(bid));
    //     }
    // }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
  } finally {
    if (db) await db.end();
  }
}

seedDatabase(); 