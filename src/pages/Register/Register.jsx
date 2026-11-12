import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  GraduationCap,
  User,
  Hash,
  Mail,
  Phone,
  BookOpen,
  Building2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ACADEMIC_YEARS, validateEmail, validatePassword } from '../../utils/constants';
import './Register.css';

export default function Register() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    course: '',
    department: '',
    academicYear: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordErrors = validatePassword(form.password);
  const requirements = [
    { label: 'At least 8 characters', met: form.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(form.password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(form.password) },
    { label: 'One number', met: /[0-9]/.test(form.password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(form.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const {
      fullName,
      studentId,
      email,
      phone,
      course,
      department,
      academicYear,
      password,
      confirmPassword,
    } = form;

    if (
      !fullName.trim() ||
      !studentId.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !course.trim() ||
      !department.trim() ||
      !academicYear ||
      !password ||
      !confirmPassword
    ) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        fullName,
        studentId,
        phone,
        course,
        department,
        academicYear,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-card success-card">
          <div className="success-icon-box">
            <CheckCircle2 size={48} className="success-icon" />
          </div>
          <h2 className="success-title">Account Created Successfully!</h2>
          <p className="success-message">
            Your student account has been registered with CampusCare. You can now sign in with your credentials to submit and track complaints.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg success-btn">
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <Link to="/" className="register-back-home">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="register-branding">
          <div className="register-logo-box">
            <Shield size={24} className="register-logo-shield" />
            <GraduationCap size={14} className="register-logo-cap" />
          </div>
          <span className="register-logo-text">CampusCare</span>
          <span className="register-portal-pill">Student Registration Portal</span>
        </div>

        <div className="register-header-text">
          <h2>Create Student Account</h2>
          <p>Join CampusCare to report issues and track resolutions</p>
        </div>

        {error && (
          <div className="register-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name & Student ID */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="studentId">Student ID / Enrollment No. *</label>
              <div className="input-wrapper">
                <Hash size={18} className="input-icon" />
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  placeholder="e.g. STU-2026-1042"
                  value={form.studentId}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">University Email *</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Course & Department */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="course">Course / Degree *</label>
              <div className="input-wrapper">
                <BookOpen size={18} className="input-icon" />
                <input
                  id="course"
                  name="course"
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={form.course}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <div className="input-wrapper">
                <Building2 size={18} className="input-icon" />
                <input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="e.g. School of Engineering"
                  value={form.department}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Academic Year */}
          <div className="form-group">
            <label htmlFor="academicYear">Academic Year *</label>
            <div className="input-wrapper">
              <GraduationCap size={18} className="input-icon" />
              <select
                id="academicYear"
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Academic Year</option>
                {ACADEMIC_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create strong password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          {form.password && (
            <div className="password-checklist-box">
              <span className="checklist-title">Password Security Requirements:</span>
              <ul className="password-requirements">
                {requirements.map((req) => (
                  <li key={req.label} className={req.met ? 'met' : 'unmet'}>
                    {req.met ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    <span>{req.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Creating Student Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already registered?{' '}
            <Link to="/login" className="login-link">
              Sign In to Your Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
