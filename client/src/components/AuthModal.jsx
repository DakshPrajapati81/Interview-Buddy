import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { RiRobot2Fill } from 'react-icons/ri';
import { FiX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const googleData = await res.json();
        await login(googleData);
        onClose();
      } catch (error) {
        console.error('Google login error:', error);
        alert('Login failed. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="auth-modal">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="auth-modal-logo">
          <div className="navbar-logo-icon" style={{ width: 30, height: 30, fontSize: '0.9rem' }}>
            <RiRobot2Fill />
          </div>
          Interview Buddy
        </div>

        <h2>Continue with</h2>
        <div className="auth-modal-subtitle">
          ✦ AI Smart Interview
        </div>

        <p>
          Sign in to start AI-powered mock interviews, track your progress,
          and unlock detailed performance insights.
        </p>

        <button className="google-btn" onClick={() => googleLogin()} id="google-login-btn">
          <FcGoogle size={20} />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
