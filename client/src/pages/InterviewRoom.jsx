import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InterviewTimer from '../components/InterviewTimer';
import VoiceRecorder from '../components/VoiceRecorder';
import { interviewAPI } from '../services/api';
import '../styles/interview.css';

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    loadInterview();
  }, [id]);

  useEffect(() => {
    if (interview && interview.questions[currentIndex]) {
      speakQuestion(interview.questions[currentIndex].questionText);
    }
  }, [currentIndex, interview?._id]);

  const loadInterview = async () => {
    try {
      const response = await interviewAPI.getById(id);
      const data = response.data;

      if (data.status === 'completed') {
        navigate(`/report/${id}`, { replace: true });
        return;
      }

      setInterview(data);

      // Find first unanswered question
      const firstUnanswered = data.questions.findIndex(q => !q.answerText);
      setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
    } catch (error) {
      console.error('Failed to load interview:', error);
      alert('Failed to load interview.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      
      utterance.onstart = () => setAiSpeaking(true);
      utterance.onend = () => setAiSpeaking(false);
      utterance.onerror = () => setAiSpeaking(false);
      
      // Small delay to let the UI update first
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 500);
    }
  };

  const handleVoiceTranscript = useCallback((transcript, isInterim) => {
    if (!isInterim) {
      setAnswer(prev => (prev ? prev + ' ' : '') + transcript);
    }
  }, []);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    window.speechSynthesis.cancel();

    try {
      const response = await interviewAPI.submitAnswer(id, {
        questionIndex: currentIndex,
        answerText: answer.trim(),
        timeSpent: 60 - timeSpent
      });

      setFeedback(response.data);

      // Wait to show feedback, then move to next or complete
      setTimeout(() => {
        if (response.data.hasNextQuestion) {
          setCurrentIndex(prev => prev + 1);
          setAnswer('');
          setFeedback(null);
          setTimerKey(prev => prev + 1);
          setTimeSpent(0);
        } else {
          // Last question — complete interview
          handleCompleteInterview();
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    setCompleting(true);
    window.speechSynthesis.cancel();

    try {
      await interviewAPI.complete(id);
      navigate(`/report/${id}`);
    } catch (error) {
      console.error('Failed to complete interview:', error);
      alert('Failed to generate report. Please try again.');
      setCompleting(false);
    }
  };

  const handleTimeUp = () => {
    if (answer.trim()) {
      handleSubmitAnswer();
    } else {
      // Auto-submit with a note
      setAnswer('(Time expired - no answer provided)');
      setTimeout(() => handleSubmitAnswer(), 100);
    }
  };

  if (loading) {
    return (
      <div className="interview-room">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading interview...</p>
        </div>
      </div>
    );
  }

  if (completing) {
    return (
      <div className="interview-completing">
        <div className="spinner"></div>
        <h2>Generating Your Report...</h2>
        <p>AI is analyzing your answers and creating a detailed evaluation.</p>
      </div>
    );
  }

  if (!interview) return null;

  const currentQuestion = interview.questions[currentIndex];

  return (
    <div className="interview-room">
      <Navbar />
      <div className="interview-content" id="interview-content">
        {/* Left Panel */}
        <div className="interview-left">
          <div className="ai-avatar-card">
            <div className="ai-avatar-img">👩‍💼</div>
            <div className="ai-avatar-question">
              {currentQuestion?.questionText}
            </div>
          </div>

          <div className="interview-status-card">
            <div className="interview-status-header">
              <span>Interview Status</span>
              {aiSpeaking && (
                <span className="ai-speaking-badge">
                  <span className="ai-speaking-dot"></span>
                  AI Speaking
                </span>
              )}
            </div>

            <div className="interview-timer-section">
              <InterviewTimer
                key={timerKey}
                duration={60}
                onTimeUp={handleTimeUp}
                isActive={!submitting && !feedback}
                onTick={(t) => setTimeSpent(t)}
              />
            </div>

            <div className="interview-counters">
              <div className="interview-counter">
                <div className="interview-counter-value">{currentIndex + 1}</div>
                <div className="interview-counter-label">Current Question</div>
              </div>
              <div className="interview-counter">
                <div className="interview-counter-value">{interview.totalQuestions}</div>
                <div className="interview-counter-label">Total Questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="interview-right">
          <div className="interview-right-header">
            <h1>AI Smart Interview</h1>
          </div>

          <div className="question-card" id="question-card">
            <div className="question-number">
              Question {currentIndex + 1} of {interview.totalQuestions}
            </div>
            <div className="question-text">
              {currentQuestion?.questionText}
            </div>
          </div>

          <div className="answer-section">
            <textarea
              className="answer-textarea"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitting || !!feedback}
              id="answer-textarea"
            />

            {feedback && (
              <div className="feedback-toast" id="feedback-toast">
                <div className="feedback-toast-header">
                  <span>Feedback</span>
                  <span className="feedback-score">{feedback.score}/10</span>
                </div>
                <div className="feedback-text">{feedback.feedback}</div>
              </div>
            )}

            <div className="interview-actions">
              <VoiceRecorder 
                onTranscript={handleVoiceTranscript} 
                disabled={submitting || !!feedback} 
              />
              <button
                className="submit-answer-btn"
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim() || !!feedback}
                id="submit-answer-btn"
              >
                {submitting ? 'Evaluating...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
