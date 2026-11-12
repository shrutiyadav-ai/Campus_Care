import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { CATEGORIES, PRIORITIES } from '../../utils/constants';
import './RaiseComplaint.css';

export default function RaiseComplaint() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    priority: 'medium',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successComplaint, setSuccessComplaint] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      category: '',
      location: '',
      priority: 'medium',
      description: '',
    });
    handleRemoveImage();
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please provide a complaint title.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category for this complaint.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        try {
          imageUrl = await complaintService.uploadImage(imageFile);
        } catch (uploadErr) {
          console.warn('Image upload skipped or bucket not configured:', uploadErr);
          // If storage bucket doesn't exist, we still allow complaint submission with text
        }
      }

      const complaint = await complaintService.submitComplaint({
        title: formData.title.trim(),
        category: formData.category,
        location: formData.location.trim(),
        priority: formData.priority,
        description: formData.description.trim(),
        imageUrl,
      });

      setSuccessComplaint(complaint);
      handleReset();
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="raise-complaint-page">
      <div className="page-header">
        <h1>Lodge a Complaint</h1>
        <p>
          Submit your campus issue with detailed information so the appropriate university department can resolve it promptly.
        </p>
      </div>

      {successComplaint && (
        <div className="alert alert-success">
          <CheckCircle2 size={24} className="alert-icon" />
          <div>
            <strong>Complaint Logged Successfully!</strong>
            <p style={{ margin: '4px 0 8px 0', fontSize: 13 }}>
              Your complaint ID is <strong>{successComplaint.complaint_id}</strong>.
              You can track its progress and status changes in "My Complaints".
            </p>
            <button
              onClick={() => navigate(`/student/complaints/${successComplaint.id}`)}
              className="btn btn-sm btn-primary"
              style={{ marginTop: 4 }}
            >
              <span>Track This Complaint</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      <div className="complaint-form-card">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              Complaint Title <span className="required">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Water leakage in 2nd Floor Washroom"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              maxLength={120}
              required
            />
          </div>

          <div className="form-row">
            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">Select a Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label htmlFor="priority">
                Urgency / Priority <span className="required">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
                required
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location">
              Campus Location / Room Number
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g., Hostel Block B, Room 304, or Science Block Lab 2"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
              maxLength={150}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Please explain the issue thoroughly (e.g. when it started, exact location, impact, equipment involved)..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={5}
              required
            />
            <div className="char-count">
              {formData.description.length} characters (minimum 20 recommended)
            </div>
          </div>

          {/* Optional Image Upload */}
          <div className="form-group">
            <label>Photo Evidence (Optional)</label>
            {!imagePreview ? (
              <div className="file-upload-area">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <Upload size={28} className="upload-icon" />
                <div className="upload-text">Click to upload photo or drag and drop</div>
                <div className="upload-hint">PNG, JPG, WEBP up to 5MB</div>
              </div>
            ) : (
              <div className="file-preview">
                <img src={imagePreview} alt="Selected preview" />
                <div className="file-info">
                  <div className="file-name">{imageFile?.name}</div>
                  <div className="file-size">
                    {(imageFile?.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={handleRemoveImage}
                  title="Remove image"
                  disabled={loading}
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-reset"
              onClick={handleReset}
              disabled={loading}
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Submitting Complaint...</span>
                </>
              ) : (
                <>
                  <FileText size={18} />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

