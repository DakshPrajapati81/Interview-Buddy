const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Upload and parse resume
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      // Clean up file
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Could not extract text from PDF. Please try a different file.' });
    }

    // Update user with resume data
    await User.findByIdAndUpdate(req.userId, {
      resumeText: resumeText.substring(0, 5000), // Limit to 5000 chars
      resumeFileName: req.file.originalname
    });

    // Clean up uploaded file (we only need the text)
    fs.unlinkSync(filePath);

    res.json({
      message: 'Resume uploaded and parsed successfully',
      fileName: req.file.originalname,
      textLength: resumeText.length
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to process resume' });
  }
};

/**
 * Get user's resume info
 */
const getResume = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('resumeText resumeFileName');
    
    res.json({
      hasResume: !!user.resumeText,
      fileName: user.resumeFileName || '',
      textPreview: user.resumeText ? user.resumeText.substring(0, 200) + '...' : ''
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete user's resume
 */
const deleteResume = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      resumeText: '',
      resumeFileName: ''
    });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  upload,
  uploadResume,
  getResume,
  deleteResume
};
