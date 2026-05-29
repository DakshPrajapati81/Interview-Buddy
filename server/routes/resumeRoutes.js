const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, uploadResume, getResume, deleteResume } = require('../controllers/resumeController');

// All routes are protected
router.use(auth);

// Upload resume
router.post('/upload', upload.single('resume'), uploadResume);

// Get resume info
router.get('/', getResume);

// Delete resume
router.delete('/', deleteResume);

module.exports = router;
