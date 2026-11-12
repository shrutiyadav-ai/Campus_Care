import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  User,
  Hash,
  Mail,
  Phone,
  BookOpen,
  Building2,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
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
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
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
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
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
        <div className="register-card">
          <div className="register-branding">
            <div className="register-logo">
              <Shield size={28} className="register-logo-icon" />
              <span className="register-logo-text">CampusCare</span>
            </div>
          </div>
          <div className="register-success">
            <CheckCircle2 size={20} />
            <span>
              Account created! Please check your email to verify your account.
            </span>
          </div>
          <p className="register-footer">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-branding">
          <div className="register-logo">
            <Shield size={28} className="register-logo-icon" />
            <span className="register-logo-text">CampusCare</span>
          </div>
          <p className="register-tagline">Create your CampusCare account</p>
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
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="studentId">Student ID / Enrollment No.</label>
              <div className="input-wrapper">
                <Hash size={18} className="input-icon" />
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  placeholder="STU-2024-001"
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
              <label htmlFor="email">University Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
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
              <label htmlFor="course">Course</label>
              <div className="input-wrapper">
                <BookOpen size={18} className="input-icon" />
                <input
                  id="course"
                  name="course"
                  type="text"
                  placeholder="B.Tech CSE"
                  value={form.course}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <div className="input-wrapper">
                <Building2 size={18} className="input-icon" />
                <input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="Computer Science"
                  value={form.department}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Academic Year */}
          <div className="form-group">
            <label htmlFor="academicYear">Academic Year</label>
            <div className="input-wrapper">
              <GraduationCap size={18} className="input-icon" />
              <select
                id="academicYear"
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Year</option>
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
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
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
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
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
            <ul className="password-requirements">
              {requirements.map((req) => (
                <li key={req.label} className={req.met ? 'met' : 'unmet'}>
                  {req.met ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  {req.label}
                </li>
              ))}
            </ul>
          )}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="spinner" />
                Creating Account…
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
