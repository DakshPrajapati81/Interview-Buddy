const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Google OAuth Login
 * Verifies the Google token and creates/finds the user
 */
const googleLogin = async (req, res) => {
  try {
    const { googleId, name, email, avatar } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ message: 'Google ID and email are required' });
    }

    // Find or create user
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        avatar
      });
    } else {
      // Update user info
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        resumeText: user.resumeText ? true : false,
        resumeFileName: user.resumeFileName
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      hasResume: !!user.resumeText,
      resumeFileName: user.resumeFileName,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  googleLogin,
  getProfile
};
