import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom from './pages/InterviewRoom';
import Report from './pages/Report';
import History from './pages/History';

// The Google Client ID is loaded from env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/interview/setup" element={
              <ProtectedRoute><InterviewSetup /></ProtectedRoute>
            } />
            <Route path="/interview/:id" element={
              <ProtectedRoute><InterviewRoom /></ProtectedRoute>
            } />
            <Route path="/report/:id" element={
              <ProtectedRoute><Report /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><History /></ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
