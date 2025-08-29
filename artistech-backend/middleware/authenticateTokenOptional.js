const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateTokenOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return next();
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return next(); 
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateTokenOptional;
