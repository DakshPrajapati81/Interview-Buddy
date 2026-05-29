import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { interviewAPI } from '../services/api';
import { FiBarChart2, FiClock, FiAward, FiPlay, FiTrendingUp } from 'react-icons/fi';
import '../styles/report.css';

const History = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({ totalInterviews: 0, completedInterviews: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    try {
      const response = await interviewAPI.getHistory(page, 10);
      setInterviews(response.data.interviews);
      setStats(response.data.stats);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getScoreClass = (score) => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'average';
    return 'poor';
  };

  if (loading) {
    return (
      <div className="history-page">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <Navbar />
      <div className="history-content">
        <div className="history-header" id="history-header">
          <h1>Interview History</h1>
          <button className="btn btn-accent" onClick={() => navigate('/interview/setup')}>
            <FiPlay /> New Interview
          </button>
        </div>

        {/* Stats */}
        <div className="history-stats">
          <div className="history-stat">
            <div className="history-stat-value">{stats.totalInterviews}</div>
            <div className="history-stat-label">Total Interviews</div>
          </div>
          <div className="history-stat">
            <div className="history-stat-value">{stats.completedInterviews}</div>
            <div className="history-stat-label">Completed</div>
          </div>
          <div className="history-stat">
            <div className="history-stat-value">{stats.averageScore || '—'}</div>
            <div className="history-stat-label">Avg Score</div>
          </div>
        </div>

        {/* Interview List */}
        {interviews.length > 0 ? (
          <>
            <div className="history-list" id="history-list">
              {interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="history-item"
                  onClick={() => navigate(
                    interview.status === 'completed' 
                      ? `/report/${interview._id}` 
                      : `/interview/${interview._id}`
                  )}
                >
                  <div className="history-item-left">
                    <div className="history-item-icon">
                      <FiBarChart2 />
                    </div>
                    <div className="history-item-info">
                      <h3>{interview.role}</h3>
                      <div className="history-item-details">
                        <span><FiClock /> {interview.experience}</span>
                        <span><FiAward /> {interview.mode}</span>
                        <span>{interview.totalQuestions} questions</span>
                      </div>
                    </div>
                  </div>
                  <div className="history-item-right">
                    {interview.status === 'completed' ? (
                      <>
                        <div className={`history-item-score ${getScoreClass(interview.overallScore)}`}>
                          {interview.overallScore}/10
                        </div>
                        <div className="history-item-date">{formatDate(interview.completedAt)}</div>
                      </>
                    ) : (
                      <>
                        <span className={`history-item-status ${interview.status}`}>
                          {interview.status === 'in-progress' ? 'In Progress' : interview.status}
                        </span>
                        <div className="history-item-date">{formatDate(interview.createdAt)}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Page {page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '60px 20px' }}>
            <div className="empty-state-icon">📋</div>
            <p>No interviews yet. Start your first one!</p>
            <button className="btn btn-accent" onClick={() => navigate('/interview/setup')}>
              <FiPlay /> Start Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
