const express = require('express');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getCurrentAdmin,
  changePassword,
  verifyToken
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentAdmin);
router.post('/change-password', protect, changePassword);
router.get('/verify', protect, verifyToken);

module.exports = router;
