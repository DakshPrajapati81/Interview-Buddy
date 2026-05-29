import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { resumeAPI, interviewAPI } from '../services/api';
import { FiUpload, FiFileText, FiX, FiPlay, FiClock, FiBarChart2, FiAward, FiTrendingUp } from 'react-icons/fi';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [resumeInfo, setResumeInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ totalInterviews: 0, completedInterviews: 0, averageScore: 0 });
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [resumeRes, historyRes] = await Promise.all([
        resumeAPI.get(),
        interviewAPI.getHistory(1, 5)
      ]);
      setResumeInfo(resumeRes.data);
      setStats(historyRes.data.stats);
      setRecentInterviews(historyRes.data.interviews);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await resumeAPI.upload(formData);
      setResumeInfo({ hasResume: true, fileName: response.data.fileName });
      updateUser({ hasResume: true, resumeFileName: response.data.fileName });
    } catch (error) {
      console.error('Resume upload failed:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      await resumeAPI.delete();
      setResumeInfo({ hasResume: false, fileName: '' });
      updateUser({ hasResume: false, resumeFileName: '' });
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'var(--primary)';
    if (score >= 6) return 'var(--info)';
    if (score >= 4) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-content">
        {/* Welcome Banner */}
        <div className="welcome-banner" id="welcome-banner">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Ready for your next interview practice session?</p>
          </div>
          {user?.avatar && (
            <img src={user.avatar} alt={user.name} className="welcome-avatar" referrerPolicy="no-referrer" />
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card-header">
              <div className="stat-card-icon green"><FiPlay /></div>
            </div>
            <div className="stat-value">{stats.totalInterviews}</div>
            <div className="stat-label">Total Interviews</div>
          </div>
          <div className="stat-card" style={{ animationDelay: '0.2s' }}>
            <div className="stat-card-header">
              <div className="stat-card-icon blue"><FiAward /></div>
            </div>
            <div className="stat-value">{stats.completedInterviews}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card" style={{ animationDelay: '0.3s' }}>
            <div className="stat-card-header">
              <div className="stat-card-icon orange"><FiTrendingUp /></div>
            </div>
            <div className="stat-value">{stats.averageScore || '—'}</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>

        {/* Resume + Quick Start */}
        <div className="dashboard-grid">
          <div className="resume-section" id="resume-section">
            <h2><FiFileText /> Resume</h2>
            {resumeInfo?.hasResume ? (
              <div className="resume-info">
                <div className="resume-info-left">
                  <div className="resume-info-icon"><FiFileText /></div>
                  <div>
                    <p>{resumeInfo.fileName}</p>
                    <span className="file-size">Uploaded & parsed</span>
                  </div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={handleDeleteResume}>
                  <FiX /> Remove
                </button>
              </div>
            ) : (
              <div className="resume-upload-area" onClick={() => fileInputRef.current?.click()}>
                <div className="resume-upload-icon"><FiUpload /></div>
                <p>{uploading ? 'Uploading...' : 'Click to upload resume (PDF)'}</p>
                <p className="hint">Upload your resume for personalized questions</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleResumeUpload}
              accept=".pdf"
              style={{ display: 'none' }}
            />
          </div>

          <div className="quick-start" id="quick-start">
            <h2><FiPlay /> Quick Start</h2>
            <div className="quick-start-card">
              <h3>Start a New Interview</h3>
              <p>Choose your role, experience, and interview mode</p>
              <button className="btn" onClick={() => navigate('/interview/setup')}>
                <FiPlay /> Start Interview
              </button>
            </div>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="recent-section" id="recent-interviews">
          <h2>
            Recent Interviews
            {recentInterviews.length > 0 && (
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/history')}>
                View All
              </button>
            )}
          </h2>
          {recentInterviews.length > 0 ? (
            <div className="recent-list">
              {recentInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="recent-item"
                  onClick={() => navigate(interview.status === 'completed' ? `/report/${interview._id}` : `/interview/${interview._id}`)}
                >
                  <div className="recent-item-left">
                    <div className="recent-item-icon"><FiBarChart2 /></div>
                    <div className="recent-item-info">
                      <h4>{interview.role}</h4>
                      <p>{interview.mode} • {interview.experience} • {formatDate(interview.createdAt)}</p>
                    </div>
                  </div>
                  <div className="recent-item-score" style={{ color: getScoreColor(interview.overallScore) }}>
                    {interview.status === 'completed' ? `${interview.overallScore}/10` : 'In Progress'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <p>No interviews yet. Start your first one!</p>
              <button className="btn btn-accent" onClick={() => navigate('/interview/setup')}>
                Start Interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
