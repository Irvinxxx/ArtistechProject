const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env file from the backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'artistech_db',
  },
  jwtSecret: process.env.JWT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  paymongo: {
    secretKey: process.env.PAYMONGO_SECRET_KEY,
    webhookSecret: process.env.PAYMONGO_WEBHOOK_SECRET,
  },
}; 