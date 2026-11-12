import { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  AlertCircle,
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
  LineChart,
  Line,
} from 'recharts';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import { formatDate } from '../../utils/constants';
import './Analytics.css';

const PRIORITY_COLORS = ['#64748B', '#F59E0B', '#EA580C', '#DC2626'];

export default function Analytics() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allComplaints, depts] = await Promise.all([
        complaintService.getAllComplaints(),
        departmentService.getDepartments(),
      ]);

      setComplaints(allComplaints);
      setDepartments(depts);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError('Failed to load analytical records.');
    } finally {
      setLoading(false);
    }
  };

  // Filter complaints by date range
  const filteredComplaints = complaints.filter((c) => {
    if (!startDate && !endDate) return true;
    const cDate = new Date(c.created_at);
    if (startDate && cDate < new Date(startDate)) return false;
    if (endDate && cDate > new Date(endDate + 'T23:59:59')) return false;
    return true;
  });

  // Calculate metrics
  const total = filteredComplaints.length;
  const resolved = filteredComplaints.filter((c) => c.status === 'resolved').length;
  const inProgress = filteredComplaints.filter((c) => c.status === 'in_progress').length;
  const pending = filteredComplaints.filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Chart data: Categories
  const categoryCounts = {};
  filteredComplaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCounts)
    .map((name) => ({ name, count: categoryCounts[name] }))
    .sort((a, b) => b.count - a.count);

  // Chart data: Priorities
  const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
  filteredComplaints.forEach((c) => {
    if (priorityCounts[c.priority] !== undefined) {
      priorityCounts[c.priority]++;
    }
  });
  const priorityData = [
    { name: 'Low', value: priorityCounts.low, color: '#64748B' },
    { name: 'Medium', value: priorityCounts.medium, color: '#F59E0B' },
    { name: 'High', value: priorityCounts.high, color: '#EA580C' },
    { name: 'Urgent', value: priorityCounts.urgent, color: '#DC2626' },
  ].filter((p) => p.value > 0);

  // Chart data: Monthly Trends
  const monthlyCounts = {};
  filteredComplaints.forEach((c) => {
    const month = new Date(c.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });
  const trendData = Object.keys(monthlyCounts).map((month) => ({
    month,
    complaints: monthlyCounts[month],
  }));

  // Chart data: Department distribution
  const deptMap = {};
  departments.forEach((d) => {
    deptMap[d.id] = d.name;
  });
  const deptCounts = {};
  filteredComplaints.forEach((c) => {
    const deptName = c.assigned_department_id ? deptMap[c.assigned_department_id] || 'Unassigned' : 'Unassigned';
    deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
  });
  const deptData = Object.keys(deptCounts)
    .map((name) => ({ name, count: deptCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Export CSV
  const handleExportReport = () => {
    if (filteredComplaints.length === 0) return;

    const headers = [
      'Complaint ID',
      'Title',
      'Category',
      'Location',
      'Priority',
      'Status',
      'Student Name',
      'Department',
      'Date Submitted',
      'Resolution Status',
    ];

    const rows = filteredComplaints.map((c) => [
      `"${c.complaint_id}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${c.category || ''}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${c.priority || ''}"`,
      `"${c.status || ''}"`,
      `"${(c.profiles?.full_name || '').replace(/"/g, '""')}"`,
      `"${c.departments?.name || 'Unassigned'}"`,
      `"${formatDate(c.created_at)}"`,
      `"${c.status === 'resolved' ? 'Resolved' : 'Open'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campuscare_analytical_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analytics-page">
      <div className="page-header-flex">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Comprehensive complaint statistics, resolution performance, and trends</p>
        </div>
        <button
          onClick={handleExportReport}
          className="btn btn-secondary btn-sm"
          disabled={filteredComplaints.length === 0}
        >
          <Download size={16} />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Date Range Filter Bar */}
      <div className="date-filter-card">
        <div className="date-filter-group">
          <div className="date-input-field">
            <label>From Date:</label>
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input-field">
            <label>To Date:</label>
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Reset Dates
            </button>
          )}
        </div>
        <div className="date-filter-summary">
          <span>
            Analyzing <strong>{total}</strong> complaints
            {startDate || endDate ? ' (Custom Range)' : ' (All-Time)'}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap total">
            <BarChart3 size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{total}</span>
            <span className="kpi-label">Complaints Received</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap resolved">
            <CheckCircle size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{resolved}</span>
            <span className="kpi-label">Issues Resolved</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap progress">
            <Clock size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{inProgress}</span>
            <span className="kpi-label">Active Work</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap rate">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{resolutionRate}%</span>
            <span className="kpi-label">Resolution Rate</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts 2x2 Grid */}
      <div className="charts-double-grid">
        {/* Category Breakdown (Horizontal Bar) */}
        <div className="chart-container-card">
          <div className="chart-header">
            <h3>Complaints by Category</h3>
            <p>Volume of complaints across university service sectors</p>
          </div>
          <div className="chart-body">
            {categoryData.length === 0 ? (
              <div className="chart-empty-msg">No category data for selected period</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#0F172A' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                    }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Breakdown (Pie Chart) */}
        <div className="chart-container-card">
          <div className="chart-header">
            <h3>Severity & Priority Distribution</h3>
            <p>Proportion of low, medium, high, and urgent issues</p>
          </div>
          <div className="chart-body">
            {priorityData.length === 0 ? (
              <div className="chart-empty-msg">No priority records found</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
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
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Complaint Trends */}
        <div className="chart-container-card">
          <div className="chart-header">
            <h3>Monthly Complaint Influx</h3>
            <p>Frequency of new reports over time</p>
          </div>
          <div className="chart-body">
            {trendData.length === 0 ? (
              <div className="chart-empty-msg">No temporal trends recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="complaints"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563EB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Complaints by Assigned Department */}
        <div className="chart-container-card">
          <div className="chart-header">
            <h3>Department Workload Distribution</h3>
            <p>Number of complaints allocated per campus department</p>
          </div>
          <div className="chart-body">
            {deptData.length === 0 ? (
              <div className="chart-empty-msg">No department allocation data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                    }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

