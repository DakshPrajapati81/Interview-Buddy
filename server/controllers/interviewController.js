const Interview = require('../models/Interview');
const { generateQuestions, evaluateAnswer, generateReport } = require('../services/aiService');
const User = require('../models/User');

/**
 * Start a new interview session
 */
const startInterview = async (req, res) => {
  try {
    const { role, experience, mode, totalQuestions } = req.body;

    if (!role || !experience) {
      return res.status(400).json({ message: 'Role and experience are required' });
    }

    // Get user's resume text if available
    const user = await User.findById(req.userId);
    const resumeText = user?.resumeText || '';

    const questionsCount = totalQuestions || 5;
    const interviewMode = mode || 'technical';

    // Generate questions using AI
    const questionTexts = await generateQuestions(
      role,
      experience,
      interviewMode,
      questionsCount,
      resumeText
    );

    // Create interview document
    const interview = await Interview.create({
      userId: req.userId,
      role,
      experience,
      mode: interviewMode,
      totalQuestions: questionsCount,
      questions: questionTexts.map(q => ({
        questionText: q,
        answerText: '',
        score: 0,
        feedback: '',
        timeSpent: 0
      })),
      status: 'in-progress',
      startedAt: new Date()
    });

    res.status(201).json({
      interviewId: interview._id,
      role: interview.role,
      experience: interview.experience,
      mode: interview.mode,
      totalQuestions: interview.totalQuestions,
      questions: interview.questions.map((q, index) => ({
        index,
        questionText: q.questionText
      })),
      status: interview.status
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: 'Failed to start interview' });
  }
};

/**
 * Submit an answer for a specific question
 */
const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, answerText, timeSpent } = req.body;

    const interview = await Interview.findOne({ _id: id, userId: req.userId });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({ message: 'Interview is not in progress' });
    }

    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    // Evaluate the answer using AI
    const evaluation = await evaluateAnswer(
      interview.questions[questionIndex].questionText,
      answerText,
      interview.role,
      interview.experience
    );

    // Update the question
    interview.questions[questionIndex].answerText = answerText;
    interview.questions[questionIndex].score = evaluation.score;
    interview.questions[questionIndex].feedback = evaluation.feedback;
    interview.questions[questionIndex].timeSpent = timeSpent || 0;

    await interview.save();

    res.json({
      questionIndex,
      score: evaluation.score,
      feedback: evaluation.feedback,
      hasNextQuestion: questionIndex < interview.questions.length - 1
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Failed to submit answer' });
  }
};

/**
 * Complete the interview and generate final report
 */
const completeInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({ _id: id, userId: req.userId });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Generate report using AI
    const report = await generateReport(interview);

    // Update interview with report data
    interview.overallScore = report.overallScore;
    interview.overallFeedback = report.overallFeedback;
    interview.strengths = report.strengths;
    interview.weaknesses = report.weaknesses;
    interview.improvements = report.improvements;
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    res.json({
      interviewId: interview._id,
      overallScore: interview.overallScore,
      overallFeedback: interview.overallFeedback,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      improvements: interview.improvements,
      questions: interview.questions,
      role: interview.role,
      experience: interview.experience,
      mode: interview.mode,
      completedAt: interview.completedAt
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ message: 'Failed to complete interview' });
  }
};

/**
 * Get interview details
 */
const getInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findOne({ _id: id, userId: req.userId });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get interview history for the current user
 */
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('role experience mode overallScore status createdAt completedAt totalQuestions');

    const total = await Interview.countDocuments({ userId: req.userId });

    // Calculate stats
    const completedInterviews = await Interview.find({ 
      userId: req.userId, 
      status: 'completed' 
    }).select('overallScore');

    const totalCompleted = completedInterviews.length;
    const avgScore = totalCompleted > 0
      ? completedInterviews.reduce((sum, i) => sum + i.overallScore, 0) / totalCompleted
      : 0;

    res.json({
      interviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalInterviews: total,
        completedInterviews: totalCompleted,
        averageScore: Math.round(avgScore * 10) / 10
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getHistory
};
