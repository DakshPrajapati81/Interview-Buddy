const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  answerText: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  feedback: {
    type: String,
    default: ''
  },
  timeSpent: {
    type: Number,
    default: 0
  }
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['technical', 'hr', 'both'],
    default: 'technical'
  },
  totalQuestions: {
    type: Number,
    default: 5
  },
  questions: [questionSchema],
  overallScore: {
    type: Number,
    default: 0
  },
  overallFeedback: {
    type: String,
    default: ''
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  improvements: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
