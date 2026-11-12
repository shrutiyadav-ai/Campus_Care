import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your university email and password.');
      return;
    }

    setLoading(true);
    try {
      const { profile } = await login({ email, password });

      if (profile?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-back-home">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="login-branding">
          <div className="login-logo-box">
            <Shield size={24} className="login-logo-shield" />
            <GraduationCap size={14} className="login-logo-cap" />
          </div>
          <span className="login-logo-text">CampusCare</span>
          <span className="login-portal-pill">University Grievance Portal</span>
        </div>

        <div className="login-header-text">
          <h2>Sign In to Your Account</h2>
          <p>Access your student reports or administrative portal</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">University Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Portal</span>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have a student account?{' '}
            <Link to="/register" className="register-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
