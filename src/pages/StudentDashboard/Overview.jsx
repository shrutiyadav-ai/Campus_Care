import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaintService';
import { formatDate, getStatusInfo, getPriorityInfo } from '../../utils/constants';
import './Overview.css';

export default function StudentOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, complaintsData] = await Promise.all([
          complaintService.getMyStats(),
          complaintService.getMyComplaints({ sortOrder: 'desc' }),
        ]);

        setStats(statsData);
        setRecentComplaints(complaintsData.slice(0, 5));
      } catch (err) {
        console.error('Error loading student dashboard:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const pendingCount = (stats.submitted || 0) + (stats.under_review || 0);

  return (
    <div className="student-overview">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back, {profile?.full_name || 'Student'}! 👋</h2>
          <p>
            Track your campus reports, monitor issue resolutions, or lodge a new complaint.
          </p>
        </div>
        <Link to="/student/raise-complaint" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Raise New Complaint</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="overview-stats-grid">
        <div className="stat-widget stat-total">
          <div className="stat-widget-icon">
            <FileText size={22} />
          </div>
          <div className="stat-widget-info">
            <span className="stat-widget-count">{stats.total || 0}</span>
            <span className="stat-widget-label">Total Complaints</span>
          </div>
        </div>

        <div className="stat-widget stat-pending">
          <div className="stat-widget-icon">
            <Clock size={22} />
          </div>
          <div className="stat-widget-info">
            <span className="stat-widget-count">{pendingCount}</span>
            <span className="stat-widget-label">Pending Review</span>
          </div>
        </div>

        <div className="stat-widget stat-progress">
          <div className="stat-widget-icon">
            <Building2 size={22} />
          </div>
          <div className="stat-widget-info">
            <span className="stat-widget-count">{stats.in_progress || 0}</span>
            <span className="stat-widget-label">In Progress</span>
          </div>
        </div>

        <div className="stat-widget stat-resolved">
          <div className="stat-widget-icon">
            <CheckCircle size={22} />
          </div>
          <div className="stat-widget-info">
            <span className="stat-widget-count">{stats.resolved || 0}</span>
            <span className="stat-widget-label">Resolved</span>
          </div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="dashboard-section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Recent Complaints</h3>
            <p className="section-card-subtitle">Your latest reported campus issues</p>
          </div>
          <Link to="/student/complaints" className="view-all-link">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="section-loading">
            <div className="spinner"></div>
            <span>Loading complaints...</span>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No complaints filed yet</h3>
            <p>Have an issue in the hostel, classroom, or campus? Submit a complaint to get it resolved quickly.</p>
            <Link to="/student/raise-complaint" className="btn btn-primary" style={{ marginTop: 16 }}>
              <PlusCircle size={18} />
              <span>Raise Your First Complaint</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Submitted Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((item) => {
                  const status = getStatusInfo(item.status);
                  const priority = getPriorityInfo(item.priority);
                  return (
                    <tr key={item.id}>
                      <td className="mono-cell">{item.complaint_id}</td>
                      <td className="title-cell">
                        <strong>{item.title}</strong>
                        {item.location && <span className="cell-subtext">{item.location}</span>}
                      </td>
                      <td>
                        <span className="badge badge-gray">{item.category}</span>
                      </td>
                      <td className="date-cell">
                        <Calendar size={14} />
                        <span>{formatDate(item.created_at)}</span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: `${priority.color}15`,
                            color: priority.color,
                            border: `1px solid ${priority.color}30`,
                          }}
                        >
                          {priority.label}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: `${status.color}15`,
                            color: status.color,
                            border: `1px solid ${status.color}30`,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/student/complaints/${item.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

