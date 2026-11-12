import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Hash,
  Phone,
  BookOpen,
  GraduationCap,
  Building2,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ACADEMIC_YEARS } from '../../utils/constants';
import './Profile.css';

export default function Profile() {
  const { profile, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    course: '',
    academicYear: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        course: profile.course || '',
        academicYear: profile.academic_year || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        course: formData.course.trim(),
        academic_year: formData.academicYear,
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="profile-header-info">
          <h2>{profile?.full_name || 'User Profile'}</h2>
          <p className="profile-email-badge">
            <Mail size={14} />
            <span>{profile?.email}</span>
          </p>
          <div className="profile-badges">
            <span className={`badge ${profile?.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>
              <Shield size={12} style={{ marginRight: 4 }} />
              {profile?.role === 'admin' ? 'Administrator' : 'Student'}
            </span>
            {profile?.student_id && (
              <span className="badge badge-gray">
                ID: {profile.student_id}
              </span>
            )}
            {profile?.department && (
              <span className="badge badge-gray">
                {profile.department}
              </span>
            )}
          </div>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="profile-content-card">
        <div className="profile-section-title">
          <h3>Personal & Academic Information</h3>
          <p>Update your contact and academic information below.</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form-input icon-input"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* University Email (Read-only) */}
            <div className="form-group">
              <label className="form-label">
                University Email (Managed by Admin)
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  className="form-input icon-input disabled"
                  value={profile?.email || ''}
                  disabled
                  readOnly
                />
              </div>
            </div>

            {/* Student ID (Read-only) */}
            <div className="form-group">
              <label className="form-label">
                Student ID / Enrollment Number
              </label>
              <div className="input-with-icon">
                <Hash size={18} className="field-icon" />
                <input
                  type="text"
                  className="form-input icon-input disabled"
                  value={profile?.student_id || 'Not Assigned'}
                  disabled
                  readOnly
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <div className="input-with-icon">
                <Phone size={18} className="field-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input icon-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Course / Program */}
            <div className="form-group">
              <label className="form-label" htmlFor="course">
                Course / Program
              </label>
              <div className="input-with-icon">
                <BookOpen size={18} className="field-icon" />
                <input
                  id="course"
                  name="course"
                  type="text"
                  className="form-input icon-input"
                  placeholder="e.g., B.Tech Computer Science"
                  value={formData.course}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Department (Read-only for academic integrity) */}
            <div className="form-group">
              <label className="form-label">
                Department
              </label>
              <div className="input-with-icon">
                <Building2 size={18} className="field-icon" />
                <input
                  type="text"
                  className="form-input icon-input disabled"
                  value={profile?.department || 'General'}
                  disabled
                  readOnly
                />
              </div>
            </div>

            {/* Academic Year */}
            <div className="form-group">
              <label className="form-label" htmlFor="academicYear">
                Academic Year
              </label>
              <div className="input-with-icon">
                <GraduationCap size={18} className="field-icon" />
                <select
                  id="academicYear"
                  name="academicYear"
                  className="form-select icon-input"
                  value={formData.academicYear}
                  onChange={handleChange}
                >
                  <option value="">Select Academic Year</option>
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="profile-form-footer">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

