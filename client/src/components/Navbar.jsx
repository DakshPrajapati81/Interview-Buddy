import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiClock } from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';

const Navbar = ({ onLoginClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <RiRobot2Fill />
          </div>
          Interview Buddy
        </Link>

        {isAuthenticated && (
          <div className="navbar-links">
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
            <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>
              History
            </Link>
          </div>
        )}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="navbar-user" ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="navbar-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="navbar-avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}

              {showDropdown && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <p>{user?.name}</p>
                    <p>{user?.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setShowDropdown(false)}>
                    <button className="navbar-dropdown-item">
                      <FiUser /> Dashboard
                    </button>
                  </Link>
                  <Link to="/history" onClick={() => setShowDropdown(false)}>
                    <button className="navbar-dropdown-item">
                      <FiClock /> History
                    </button>
                  </Link>
                  <button className="navbar-dropdown-item danger" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="navbar-login-btn" onClick={onLoginClick} id="login-btn">
              <FiUser /> Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
