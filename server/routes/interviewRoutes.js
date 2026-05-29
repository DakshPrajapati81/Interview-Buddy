const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getHistory
} = require('../controllers/interviewController');

// All routes are protected
router.use(auth);

// Get interview history (must be before /:id routes)
router.get('/history', getHistory);

// Start a new interview
router.post('/start', startInterview);

// Get interview details
router.get('/:id', getInterview);

// Submit an answer
router.post('/:id/answer', submitAnswer);

// Complete interview and generate report
router.post('/:id/complete', completeInterview);

module.exports = router;
