import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { interviewAPI } from '../services/api';
import { FiDownload, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiClock, FiBriefcase, FiUser } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../styles/report.css';

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const response = await interviewAPI.getById(id);
      setInterview(response.data);
    } catch (error) {
      console.error('Failed to load report:', error);
      alert('Failed to load report.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'average';
    return 'poor';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Needs Improvement';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = margin;

      // Header
      pdf.setFillColor(16, 185, 129);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('InterviewIQ.AI', margin, 18);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI-Powered Interview Performance Report', margin, 28);
      pdf.text(formatDate(interview.completedAt || interview.createdAt), margin, 35);

      yPos = 50;

      // Interview Info
      pdf.setTextColor(17, 24, 39);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Interview Details', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Role: ${interview.role}`, margin, yPos); yPos += 6;
      pdf.text(`Experience: ${interview.experience}`, margin, yPos); yPos += 6;
      pdf.text(`Mode: ${interview.mode.charAt(0).toUpperCase() + interview.mode.slice(1)}`, margin, yPos); yPos += 6;
      pdf.text(`Questions: ${interview.totalQuestions}`, margin, yPos); yPos += 10;

      // Overall Score
      pdf.setTextColor(17, 24, 39);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Overall Score', margin, yPos);
      yPos += 8;

      pdf.setFontSize(28);
      pdf.setTextColor(16, 185, 129);
      pdf.text(`${interview.overallScore}/10`, margin, yPos);
      pdf.setFontSize(12);
      pdf.setTextColor(75, 85, 99);
      pdf.text(` — ${getScoreLabel(interview.overallScore)}`, margin + 32, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const feedbackLines = pdf.splitTextToSize(interview.overallFeedback || '', contentWidth);
      pdf.text(feedbackLines, margin, yPos);
      yPos += feedbackLines.length * 5 + 8;

      // Strengths
      if (interview.strengths?.length > 0) {
        pdf.setTextColor(16, 185, 129);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('✓ Strengths', margin, yPos);
        yPos += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        interview.strengths.forEach(s => {
          pdf.text(`• ${s}`, margin + 4, yPos);
          yPos += 6;
        });
        yPos += 4;
      }

      // Weaknesses
      if (interview.weaknesses?.length > 0) {
        pdf.setTextColor(239, 68, 68);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('✗ Areas for Improvement', margin, yPos);
        yPos += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        interview.weaknesses.forEach(w => {
          pdf.text(`• ${w}`, margin + 4, yPos);
          yPos += 6;
        });
        yPos += 4;
      }

      // Improvements
      if (interview.improvements?.length > 0) {
        pdf.setTextColor(59, 130, 246);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('→ Suggestions', margin, yPos);
        yPos += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        interview.improvements.forEach(imp => {
          pdf.text(`• ${imp}`, margin + 4, yPos);
          yPos += 6;
        });
        yPos += 4;
      }

      // Questions & Answers
      pdf.addPage();
      yPos = margin;

      pdf.setTextColor(17, 24, 39);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Question-by-Question Breakdown', margin, yPos);
      yPos += 10;

      interview.questions.forEach((q, i) => {
        // Check if we need a new page
        if (yPos > 260) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(17, 24, 39);
        const qLines = pdf.splitTextToSize(`Q${i + 1}: ${q.questionText}`, contentWidth);
        pdf.text(qLines, margin, yPos);
        yPos += qLines.length * 5 + 3;

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(75, 85, 99);
        const aLines = pdf.splitTextToSize(`A: ${q.answerText || 'No answer provided'}`, contentWidth);
        pdf.text(aLines, margin, yPos);
        yPos += aLines.length * 5 + 3;

        pdf.setTextColor(16, 185, 129);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Score: ${q.score}/10`, margin, yPos);
        yPos += 5;

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128);
        const fLines = pdf.splitTextToSize(`Feedback: ${q.feedback || 'N/A'}`, contentWidth);
        pdf.text(fLines, margin, yPos);
        yPos += fLines.length * 5 + 8;

        // Separator line
        pdf.setDrawColor(229, 231, 235);
        pdf.line(margin, yPos - 3, pageWidth - margin, yPos - 3);
        yPos += 4;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Generated by InterviewIQ.AI — AI Powered Smart Interview Platform', margin, 290);

      pdf.save(`InterviewIQ_Report_${interview.role.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="report-page">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const scoreClass = getScoreClass(interview.overallScore);
  const circumference = 2 * Math.PI * 58;
  const scoreOffset = circumference - (interview.overallScore / 10) * circumference;

  return (
    <div className="report-page">
      <Navbar />
      <div className="report-content" ref={reportRef}>
        {/* Report Header */}
        <div className="report-header" id="report-header">
          <h1>Interview Performance Report</h1>
          <div className="report-meta">
            <span className="report-meta-item"><FiUser /> {interview.role}</span>
            <span className="report-meta-item"><FiBriefcase /> {interview.experience}</span>
            <span className="report-meta-item"><FiClock /> {interview.mode}</span>
          </div>

          {/* Score Circle */}
          <div className="score-section">
            <div className="score-circle">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle className="score-circle-bg" cx="70" cy="70" r="58" />
                <circle
                  className={`score-circle-progress ${scoreClass}`}
                  cx="70" cy="70" r="58"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
                />
              </svg>
              <div className="score-value">
                <div className="number" style={{ color: scoreClass === 'excellent' ? 'var(--primary)' : scoreClass === 'good' ? 'var(--info)' : scoreClass === 'average' ? 'var(--warning)' : 'var(--danger)' }}>
                  {interview.overallScore}
                </div>
                <div className="out-of">/10</div>
              </div>
            </div>
            <div className="score-label">{getScoreLabel(interview.overallScore)}</div>
            <p className="overall-feedback">{interview.overallFeedback}</p>
          </div>
        </div>

        {/* Strengths, Weaknesses, Improvements */}
        <div className="report-cards-grid">
          <div className="report-card strengths-card">
            <h3><span className="icon"><FiCheckCircle /></span> Strengths</h3>
            <ul>
              {interview.strengths?.map((s, i) => (
                <li key={i}><span className="bullet" style={{ color: 'var(--primary)' }}>✓</span> {s}</li>
              ))}
            </ul>
          </div>
          <div className="report-card weaknesses-card">
            <h3><span className="icon"><FiAlertCircle /></span> Weaknesses</h3>
            <ul>
              {interview.weaknesses?.map((w, i) => (
                <li key={i}><span className="bullet" style={{ color: 'var(--danger)' }}>✗</span> {w}</li>
              ))}
            </ul>
          </div>
          <div className="report-card improvements-card">
            <h3><span className="icon"><FiTrendingUp /></span> Improvements</h3>
            <ul>
              {interview.improvements?.map((imp, i) => (
                <li key={i}><span className="bullet" style={{ color: 'var(--info)' }}>→</span> {imp}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Questions Breakdown */}
        <div className="questions-breakdown" id="questions-breakdown">
          <h2>Question-by-Question Breakdown</h2>
          {interview.questions?.map((q, i) => (
            <div className="question-item" key={i}>
              <div className="question-item-header">
                <div>
                  <div className="question-item-number">Question {i + 1}</div>
                  <div className="question-item-text">{q.questionText}</div>
                </div>
                <span className={`question-item-score ${getScoreClass(q.score)}`}>
                  {q.score}/10
                </span>
              </div>
              <div className="question-item-answer">
                <div className="question-item-answer-label">Your Answer</div>
                <p>{q.answerText || 'No answer provided'}</p>
              </div>
              {q.feedback && (
                <div className="question-item-feedback">
                  <strong>Feedback: </strong>{q.feedback}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="report-actions" id="report-actions">
          <button className="btn btn-primary btn-lg" onClick={handleDownloadPDF} disabled={downloading}>
            <FiDownload /> {downloading ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;
