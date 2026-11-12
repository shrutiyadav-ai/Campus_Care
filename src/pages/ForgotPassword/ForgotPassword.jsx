import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your university email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-branding">
          <div className="auth-logo">
            <Shield size={26} className="logo-icon" />
            <span className="logo-text">CampusCare</span>
          </div>
          <h2 className="auth-title">Password Recovery</h2>
          <p className="auth-subtitle">
            Enter your university email address and we will send you a secure link to reset your password.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="reset-success-box">
            <div className="success-icon-wrap">
              <CheckCircle2 size={40} />
            </div>
            <h3>Password Reset Link Sent</h3>
            <p>
              We have sent a password reset link to <strong>{email}</strong>.
              Please check your inbox (and spam folder) and follow the instructions.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                University Email Address
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-input icon-input"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Sending Link...</span>
                </>
              ) : (
                'Send Recovery Link'
              )}
            </button>

            <div className="auth-footer-nav">
              <Link to="/login" className="back-link">
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

