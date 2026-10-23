const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (id, expiresIn = config.jwtExpiresIn) => jwt.sign({ id }, config.jwtSecret, { expiresIn });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    throw new Error('Invalid or expired token');
  }
};

const decodeToken = (token) => jwt.decode(token);

module.exports = { generateToken, verifyToken, decodeToken };
