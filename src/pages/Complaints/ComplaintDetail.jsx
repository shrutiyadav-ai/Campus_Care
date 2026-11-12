import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Shield,
  MessageSquare,
  FileText,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import {
  STATUSES,
  PRIORITIES,
  STATUS_FLOW,
  formatDate,
  formatDateTime,
  getStatusInfo,
  getPriorityInfo,
} from '../../utils/constants';
import './ComplaintDetail.css';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin update form state
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [internalRemarks, setInternalRemarks] = useState('');

  useEffect(() => {
    loadComplaintDetails();
  }, [id]);

  const loadComplaintDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [complaintData, historyData] = await Promise.all([
        complaintService.getComplaintById(id),
        complaintService.getComplaintHistory(id),
      ]);

      setComplaint(complaintData);
      setHistory(historyData);

      // Initialize admin editable fields
      setNewStatus(complaintData.status);
      setNewPriority(complaintData.priority);
      setAssignedDepartment(complaintData.assigned_department_id || '');
      setResolutionMessage(complaintData.resolution_message || '');

      if (isAdmin) {
        const depts = await departmentService.getDepartments(true);
        setDepartments(depts);
      }
    } catch (err) {
      console.error('Error loading complaint detail:', err);
      setError('Could not load complaint details. It may not exist or you lack permission.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const statusChanged = complaint.status !== newStatus;
      const oldStatus = complaint.status;

      // Update complaint in database
      const updated = await complaintService.updateComplaint(id, {
        status: newStatus,
        priority: newPriority,
        assigned_department_id: assignedDepartment || null,
        resolution_message: resolutionMessage.trim(),
      });

      // Add audit history record if remarks or status changed
      if (statusChanged || internalRemarks.trim()) {
        await complaintService.addHistoryEntry({
          complaintId: id,
          oldStatus,
          newStatus,
          remarks: internalRemarks.trim() || `Status updated to ${getStatusInfo(newStatus).label}`,
        });
      }

      setComplaint(updated);
      setInternalRemarks('');
      setSuccess('Complaint updated successfully.');

      // Refresh history
      const updatedHistory = await complaintService.getComplaintHistory(id);
      setHistory(updatedHistory);

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Update complaint error:', err);
      setError(err.message || 'Failed to update complaint.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading-state">
        <div className="spinner spinner-lg"></div>
        <p>Loading complaint details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="complaint-detail-error">
        <AlertCircle size={40} className="error-icon" />
        <h2>Unable to Display Complaint</h2>
        <p>{error || 'Complaint not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ marginTop: 16 }}
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  const currentStatusInfo = getStatusInfo(complaint.status);
  const currentPriorityInfo = getPriorityInfo(complaint.priority);

  // Status timeline helper
  const currentStepIndex = STATUS_FLOW.indexOf(complaint.status);

  return (
    <div className="complaint-detail-container">
      {/* Top Navigation */}
      <div className="detail-top-bar">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>
        <div className="detail-meta-pill">
          <span className="complaint-id-badge">{complaint.complaint_id}</span>
          <span
            className="badge"
            style={{
              backgroundColor: `${currentStatusInfo.color}15`,
              color: currentStatusInfo.color,
              border: `1px solid ${currentStatusInfo.color}30`,
            }}
          >
            {currentStatusInfo.label}
          </span>
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

      {/* Main Grid: Details on Left, Timeline/Admin on Right */}
      <div className="detail-grid">
        <div className="detail-primary-col">
          {/* Main Info Card */}
          <div className="complaint-main-card">
            <div className="complaint-card-header">
              <div className="category-and-priority">
                <span className="badge badge-gray">{complaint.category}</span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: `${currentPriorityInfo.color}15`,
                    color: currentPriorityInfo.color,
                    border: `1px solid ${currentPriorityInfo.color}30`,
                  }}
                >
                  {currentPriorityInfo.label} Priority
                </span>
              </div>
              <h1 className="complaint-title-large">{complaint.title}</h1>
              <div className="complaint-meta-row">
                <span className="meta-item">
                  <Calendar size={14} />
                  <span>Submitted on {formatDateTime(complaint.created_at)}</span>
                </span>
                {complaint.location && (
                  <span className="meta-item">
                    <MapPin size={14} />
                    <span>{complaint.location}</span>
                  </span>
                )}
                {complaint.departments?.name && (
                  <span className="meta-item">
                    <Building2 size={14} />
                    <span>Dept: {complaint.departments.name}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="complaint-description-section">
              <h3>Description</h3>
              <p className="description-body">{complaint.description}</p>
            </div>

            {/* Attached Photo */}
            {complaint.image_url && (
              <div className="complaint-photo-section">
                <h3>Attached Photo Evidence</h3>
                <div className="photo-container">
                  <img
                    src={complaint.image_url}
                    alt="Complaint evidence"
                    className="evidence-photo"
                  />
                </div>
              </div>
            )}

            {/* Resolution Message if Available */}
            {complaint.resolution_message && (
              <div className="resolution-message-box">
                <div className="resolution-header">
                  <CheckCircle2 size={20} className="resolution-icon" />
                  <h4>Official University Resolution</h4>
                </div>
                <p className="resolution-text">{complaint.resolution_message}</p>
                {complaint.resolved_at && (
                  <span className="resolution-date">
                    Resolved at {formatDateTime(complaint.resolved_at)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Student Info Card (Admin View Only) */}
          {isAdmin && complaint.profiles && (
            <div className="student-info-card">
              <div className="student-info-header">
                <User size={18} />
                <h3>Student Information</h3>
              </div>
              <div className="student-info-grid">
                <div>
                  <strong>Full Name</strong>
                  <span>{complaint.profiles.full_name || 'N/A'}</span>
                </div>
                <div>
                  <strong>Student ID</strong>
                  <span>{complaint.profiles.student_id || 'N/A'}</span>
                </div>
                <div>
                  <strong>University Email</strong>
                  <span>{complaint.profiles.email || 'N/A'}</span>
                </div>
                <div>
                  <strong>Phone</strong>
                  <span>{complaint.profiles.phone || 'N/A'}</span>
                </div>
                <div>
                  <strong>Academic Dept</strong>
                  <span>{complaint.profiles.department || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Complaint History Log */}
          <div className="history-log-card">
            <h3 className="history-log-title">Audit Trail & Activity Log</h3>
            {history.length === 0 ? (
              <p className="no-history-text">No status updates logged yet.</p>
            ) : (
              <div className="history-list">
                {history.map((item, idx) => (
                  <div key={item.id || idx} className="history-item">
                    <div className="history-bullet" />
                    <div className="history-content">
                      <div className="history-top">
                        <span className="history-change">
                          Status changed to <strong>{getStatusInfo(item.new_status).label}</strong>
                          {item.profiles?.full_name && ` by ${item.profiles.full_name}`}
                        </span>
                        <span className="history-time">
                          {formatDateTime(item.created_at)}
                        </span>
                      </div>
                      {item.remarks && (
                        <p className="history-remarks">{item.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column: Timeline & Admin Controls */}
        <div className="detail-secondary-col">
          {/* Status Timeline */}
          <div className="status-timeline-card">
            <h3 className="timeline-title">Resolution Timeline</h3>
            <div className="timeline-steps">
              {STATUS_FLOW.map((statusKey, index) => {
                const info = getStatusInfo(statusKey);
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div
                    key={statusKey}
                    className={`timeline-step ${isCompleted ? 'completed' : ''} ${
                      isCurrent ? 'current' : ''
                    }`}
                  >
                    <div className="step-indicator">
                      {isCompleted ? <Check size={14} /> : <span>{index + 1}</span>}
                    </div>
                    <div className="step-details">
                      <div className="step-label">{info.label}</div>
                      <div className="step-sublabel">
                        {statusKey === 'submitted' && 'Complaint received in system'}
                        {statusKey === 'under_review' && 'Reviewed by department admin'}
                        {statusKey === 'in_progress' && 'Work is actively underway'}
                        {statusKey === 'resolved' && 'Issue resolved and closed'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Management Section */}
          {isAdmin && (
            <div className="admin-action-card">
              <div className="admin-action-header">
                <Shield size={18} className="shield-icon" />
                <h3>Admin Action Panel</h3>
              </div>

              <form onSubmit={handleAdminUpdate} className="admin-form">
                {/* Status Selection */}
                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={updating}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <div className="form-group">
                  <label className="form-label">Urgency / Priority</label>
                  <select
                    className="form-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    disabled={updating}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Department */}
                <div className="form-group">
                  <label className="form-label">Assign Department</label>
                  <select
                    className="form-select"
                    value={assignedDepartment}
                    onChange={(e) => setAssignedDepartment(e.target.value)}
                    disabled={updating}
                  >
                    <option value="">Unassigned</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resolution Message */}
                <div className="form-group">
                  <label className="form-label">
                    Resolution Message (Visible to Student)
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Provide details on how the issue was fixed..."
                    value={resolutionMessage}
                    onChange={(e) => setResolutionMessage(e.target.value)}
                    disabled={updating}
                  />
                </div>

                {/* Internal Remarks */}
                <div className="form-group">
                  <label className="form-label">
                    Internal Remarks (Activity Log)
                  </label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="e.g., Assigned technician Sharma for electrical inspection..."
                    value={internalRemarks}
                    onChange={(e) => setInternalRemarks(e.target.value)}
                    disabled={updating}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Updates</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

