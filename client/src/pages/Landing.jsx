import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import FeatureCard from '../components/FeatureCard';
import Footer from '../components/Footer';
import { RiRobot2Fill } from 'react-icons/ri';
import { FiMic, FiClock, FiBarChart2, FiFileText, FiUser, FiTarget, FiAward, FiTrendingUp } from 'react-icons/fi';
import '../styles/landing.css';

const Landing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartInterview = () => {
    if (isAuthenticated) {
      navigate('/interview/setup');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleViewHistory = () => {
    if (isAuthenticated) {
      navigate('/history');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="landing">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />

      {/* Hero Section */}
      <section className="hero container" id="hero-section">
        <div className="hero-badge">
          ✦ AI Powered Smart Interview Platform
        </div>
        <h1>
          Practice Interviews with<br />
          <span className="gradient-text">AI Intelligence</span>
        </h1>
        <p className="hero-description">
          Role-based mock interviews with smart follow-ups, adaptive difficulty 
          and real-time performance evaluation.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary btn-lg" onClick={handleStartInterview} id="start-interview-btn">
            Start Interview
          </button>
          <button className="btn btn-secondary btn-lg" onClick={handleViewHistory} id="view-history-btn">
            View History
          </button>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section container" id="steps-section">
        <div className="steps-grid">
          <FeatureCard
            step="1"
            icon={<FiUser />}
            title="Role & Experience Selection"
            description="AI adjusts difficulty based on selected job role."
            color="green"
            delay={0.1}
          />
          <FeatureCard
            step="2"
            icon={<FiMic />}
            title="Smart Voice Interview"
            description="Dynamic follow-up questions based on your answers."
            color="green"
            delay={0.2}
          />
          <FeatureCard
            step="3"
            icon={<FiClock />}
            title="Timer Based Simulation"
            description="Real interview pressure with time tracking."
            color="green"
            delay={0.3}
          />
        </div>
      </section>

      {/* Advanced AI Capabilities */}
      <section className="capabilities-section" id="capabilities-section">
        <div className="container">
          <h2 className="section-title text-center">
            Advanced AI <span>Capabilities</span>
          </h2>
          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="capability-card-img">🤖</div>
              <div>
                <div className="capability-card-icon"><FiBarChart2 /></div>
                <h3>AI Answer Evaluation</h3>
                <p>Scores communication, technical accuracy and confidence.</p>
              </div>
            </div>
            <div className="capability-card">
              <div className="capability-card-img">📄</div>
              <div>
                <div className="capability-card-icon"><FiFileText /></div>
                <h3>Resume Based Interview</h3>
                <p>Project-specific questions based on uploaded resume.</p>
              </div>
            </div>
            <div className="capability-card">
              <div className="capability-card-img">📊</div>
              <div>
                <div className="capability-card-icon"><FiFileText /></div>
                <h3>Downloadable PDF Report</h3>
                <p>Detailed strengths, weaknesses and improvement insights.</p>
              </div>
            </div>
            <div className="capability-card">
              <div className="capability-card-img">📈</div>
              <div>
                <div className="capability-card-icon"><FiTrendingUp /></div>
                <h3>History & Analytics</h3>
                <p>Track progress with performance graphs and topic analysis.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Modes */}
      <section className="modes-section container" id="modes-section">
        <h2 className="section-title text-center">
          Multiple Interview <span>Modes</span>
        </h2>
        <div className="modes-grid">
          <div className="mode-card">
            <div>
              <h3>HR Interview Mode</h3>
              <p>Behavioral and communication based evaluation.</p>
            </div>
            <div className="mode-card-emoji">👥</div>
          </div>
          <div className="mode-card">
            <div>
              <h3>Technical Mode</h3>
              <p>Deep technical questioning based on selected role.</p>
            </div>
            <div className="mode-card-emoji">💻</div>
          </div>
          <div className="mode-card">
            <div>
              <h3>Confidence Detection</h3>
              <p>Basic tone and voice analysis insights.</p>
            </div>
            <div className="mode-card-emoji">🎯</div>
          </div>
          <div className="mode-card">
            <div>
              <h3>Combined Mode</h3>
              <p>Mix of technical and HR questions for complete prep.</p>
            </div>
            <div className="mode-card-emoji">⚡</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta-section">
        <div className="container">
          <h2>Ready to Ace Your Next Interview?</h2>
          <p>Start practicing with AI-powered mock interviews today.</p>
          <button className="btn btn-primary btn-lg" onClick={handleStartInterview}>
            Get Started — It's Free
          </button>
        </div>
      </section>

      <Footer />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Landing;
