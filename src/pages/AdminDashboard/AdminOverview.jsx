import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  Loader,
  CheckCircle,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import { formatDate, getStatusInfo, getPriorityInfo } from '../../utils/constants';
import NeonStatusBanner from '../../components/dashboard/NeonStatusBanner';
import './AdminOverview.css';

const PRIORITY_COLORS = {
  low: '#64748B',
  medium: '#F59E0B',
  high: '#EA580C',
  urgent: '#DC2626',
};

export default function AdminOverview() {
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    in_progress: 0,
    resolved: 0,
    byCategory: {},
    byPriority: {},
  });
  const [studentCount, setStudentCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      setError('');
      try {
        const [statsData, complaintsData, sCount, depts] = await Promise.all([
          complaintService.getStats(),
          complaintService.getAllComplaints({ sortOrder: 'desc' }),
          departmentService.getStudentCount(),
          departmentService.getDepartments(),
        ]);

        setStats(statsData);
        setRecentComplaints(complaintsData.slice(0, 8));
        setStudentCount(sCount);
        setDepartmentCount(depts.length);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
        setError('Failed to load administrative metrics.');
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const pendingCount = (stats.submitted || 0) + (stats.under_review || 0);

  // Prepare Category Chart Data
  const categoryChartData = Object.keys(stats.byCategory || {}).map((cat) => ({
    name: cat,
    count: stats.byCategory[cat],
  })).sort((a, b) => b.count - a.count).slice(0, 6);

  // Prepare Priority Pie Data
  const priorityChartData = Object.keys(stats.byPriority || {}).map((pri) => ({
    name: pri.charAt(0).toUpperCase() + pri.slice(1),
    value: stats.byPriority[pri],
    color: PRIORITY_COLORS[pri] || '#2563EB',
  }));

  return (
    <div className="admin-overview">
      <NeonStatusBanner />

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Key Metrics Cards */}
      <div className="admin-metrics-grid">
        <div className="metric-card metric-total">
          <div className="metric-header">
            <span className="metric-label">Total Complaints</span>
            <div className="metric-icon">
              <FileText size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.total}</div>
          <span className="metric-subtext">Across all categories</span>
        </div>

        <div className="metric-card metric-pending">
          <div className="metric-header">
            <span className="metric-label">Pending Review</span>
            <div className="metric-icon">
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value">{pendingCount}</div>
          <span className="metric-subtext">Needs action or assignment</span>
        </div>

        <div className="metric-card metric-progress">
          <div className="metric-header">
            <span className="metric-label">In Progress</span>
            <div className="metric-icon">
              <Loader size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.in_progress}</div>
          <span className="metric-subtext">Under active department resolution</span>
        </div>

        <div className="metric-card metric-resolved">
          <div className="metric-header">
            <span className="metric-label">Resolved Issues</span>
            <div className="metric-icon">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.resolved}</div>
          <span className="metric-subtext">Successfully addressed</span>
        </div>

        <div className="metric-card metric-students">
          <div className="metric-header">
            <span className="metric-label">Registered Students</span>
            <div className="metric-icon">
              <Users size={20} />
            </div>
          </div>
          <div className="metric-value">{studentCount}</div>
          <span className="metric-subtext">Active portal accounts</span>
        </div>

        <div className="metric-card metric-departments">
          <div className="metric-header">
            <span className="metric-label">Total Departments</span>
            <div className="metric-icon">
              <Building2 size={20} />
            </div>
          </div>
          <div className="metric-value">{departmentCount}</div>
          <span className="metric-subtext">Campus service units</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="admin-charts-grid">
        {/* Category Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Complaints by Top Categories</h3>
            <span className="chart-subtitle">Distribution across departments</span>
          </div>
          <div className="chart-render-wrap">
            {categoryChartData.length === 0 ? (
              <div className="chart-empty">No category data recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Severity & Priority Breakdown</h3>
            <span className="chart-subtitle">Urgency classification</span>
          </div>
          <div className="chart-render-wrap">
            {priorityChartData.length === 0 ? (
              <div className="chart-empty">No priority data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="admin-table-card">
        <div className="table-card-header">
          <div>
            <h3>Recent Complaints</h3>
            <p>Latest issues filed by students requiring review or updates</p>
          </div>
          <Link to="/admin/complaints" className="view-all-link">
            <span>Manage All Complaints</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Loading complaints...</span>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={44} />
            <h3>No complaints recorded</h3>
            <p>Any complaints submitted by students will appear in this administrative dashboard.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((item) => {
                  const status = getStatusInfo(item.status);
                  const priority = getPriorityInfo(item.priority);
                  return (
                    <tr key={item.id}>
                      <td className="mono-cell">
                        <Link to={`/admin/complaints/${item.id}`} className="id-link">
                          {item.complaint_id}
                        </Link>
                      </td>
                      <td className="title-cell">
                        <strong>{item.title}</strong>
                        {item.location && <span className="cell-subtext">{item.location}</span>}
                      </td>
                      <td>
                        <span className="student-name">
                          {item.profiles?.full_name || 'Student'}
                        </span>
                        {item.profiles?.student_id && (
                          <span className="cell-subtext">{item.profiles.student_id}</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-gray">{item.category}</span>
                      </td>
                      <td>
                        <span className="dept-name">
                          {item.departments?.name || 'Unassigned'}
                        </span>
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
                      <td className="date-cell">
                        <Calendar size={14} />
                        <span>{formatDate(item.created_at)}</span>
                      </td>
                      <td>
                        <Link
                          to={`/admin/complaints/${item.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          Review
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

