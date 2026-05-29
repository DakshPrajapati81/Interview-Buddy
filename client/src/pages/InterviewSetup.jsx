import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { interviewAPI, resumeAPI } from '../services/api';
import { FiUser, FiBriefcase, FiUpload, FiFileText, FiX, FiChevronRight, FiMic, FiBarChart2 } from 'react-icons/fi';
import '../styles/interview.css';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [mode, setMode] = useState('technical');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);

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
      await resumeAPI.upload(formData);
      setResumeFile(file.name);
    } catch (error) {
      console.error('Resume upload failed:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!role.trim()) {
      alert('Please enter a role');
      return;
    }
    if (!experience.trim()) {
      alert('Please enter your experience');
      return;
    }

    setStarting(true);
    try {
      const response = await interviewAPI.start({
        role: role.trim(),
        experience: experience.trim(),
        mode,
        totalQuestions
      });
      navigate(`/interview/${response.data.interviewId}`);
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview. Please try again.');
      setStarting(false);
    }
  };

  return (
    <div className="interview-setup">
      <Navbar />
      <div className="setup-content">
        <div className="setup-card" id="setup-card">
          {/* Left Panel */}
          <div className="setup-left">
            <h1>Start Your AI Interview</h1>
            <p>
              Practice real interview scenarios powered by AI. Improve 
              communication, technical skills, and confidence.
            </p>
            <div className="setup-steps">
              <div className="setup-step">
                <span className="setup-step-icon"><FiUser /></span>
                <span>Choose Role & Experience</span>
              </div>
              <div className="setup-step">
                <span className="setup-step-icon"><FiMic /></span>
                <span>Smart Voice Interview</span>
              </div>
              <div className="setup-step">
                <span className="setup-step-icon"><FiBarChart2 /></span>
                <span>Performance Analytics</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="setup-right">
            <h2>Interview Setup</h2>
            <div className="setup-form">
              <div className="form-group">
                <div className="form-input">
                  <FiUser className="form-input-icon" />
                  <input
                    type="text"
                    placeholder="Enter Role (e.g., Frontend Developer)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    id="role-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-input">
                  <FiBriefcase className="form-input-icon" />
                  <input
                    type="text"
                    placeholder="Experience (e.g., 2 years)"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    id="experience-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-input">
                  <select 
                    value={mode} 
                    onChange={(e) => setMode(e.target.value)}
                    id="mode-select"
                  >
                    <option value="technical">Technical Interview</option>
                    <option value="hr">HR Interview</option>
                    <option value="both">Combined (Technical + HR)</option>
                  </select>
                  <FiChevronRight className="form-input-icon" style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>

              <div className="form-group">
                <div className="form-input">
                  <select 
                    value={totalQuestions} 
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    id="questions-select"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                  <FiChevronRight className="form-input-icon" style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>

              {/* Resume Upload */}
              {resumeFile ? (
                <div className="setup-resume-uploaded">
                  <FiFileText className="setup-resume-uploaded-icon" />
                  <span>{resumeFile}</span>
                  <button className="setup-resume-remove" onClick={() => setResumeFile(null)}>
                    <FiX />
                  </button>
                </div>
              ) : (
                <div 
                  className="setup-resume-upload" 
                  onClick={() => fileInputRef.current?.click()}
                  id="resume-upload"
                >
                  <div className="setup-resume-upload-icon"><FiUpload /></div>
                  <p>{uploading ? 'Uploading...' : 'Click to upload resume (Optional)'}</p>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleResumeUpload}
                accept=".pdf"
                style={{ display: 'none' }}
              />

              <button
                className="setup-submit-btn"
                onClick={handleStartInterview}
                disabled={starting || !role.trim() || !experience.trim()}
                id="start-interview-submit"
              >
                {starting ? 'Starting Interview...' : 'Start Interview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
