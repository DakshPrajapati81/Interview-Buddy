const express = require('express');
const router = express.Router();
const { googleLogin, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Google OAuth login
router.post('/google', googleLogin);

// Get user profile (protected)
router.get('/profile', auth, getProfile);

module.exports = router;
