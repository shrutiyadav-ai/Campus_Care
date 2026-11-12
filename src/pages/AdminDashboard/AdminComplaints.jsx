import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  formatDate,
  getStatusInfo,
  getPriorityInfo,
} from '../../utils/constants';
import './AdminComplaints.css';

export default function AdminComplaints({ presetStatus }) {
  const location = useLocation();

  // Determine if URL indicates pre-filtered status
  let initialStatus = presetStatus || 'all';
  if (location.pathname.includes('/pending')) initialStatus = 'submitted';
  if (location.pathname.includes('/in-progress')) initialStatus = 'in_progress';
  if (location.pathname.includes('/resolved')) initialStatus = 'resolved';

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Update status filter if path changed
    if (location.pathname.includes('/pending')) setStatusFilter('submitted');
    else if (location.pathname.includes('/in-progress')) setStatusFilter('in_progress');
    else if (location.pathname.includes('/resolved')) setStatusFilter('resolved');
    else if (location.pathname === '/admin/complaints') setStatusFilter('all');
  }, [location.pathname]);

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter, departmentFilter, sortOrder]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getAllComplaints({
        searchQuery: searchQuery.trim(),
        statusFilter,
        categoryFilter,
        priorityFilter,
        departmentFilter,
        sortOrder,
      });
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching admin complaints:', err);
      setError('Failed to fetch complaints list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setSortOrder('desc');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (complaints.length === 0) return;

    const headers = [
      'Complaint ID',
      'Title',
      'Category',
      'Location',
      'Priority',
      'Status',
      'Student Name',
      'Student ID',
      'Department Assigned',
      'Created Date',
      'Resolution Message',
    ];

    const rows = complaints.map((c) => [
      `"${c.complaint_id}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${c.category || ''}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${c.priority || ''}"`,
      `"${c.status || ''}"`,
      `"${(c.profiles?.full_name || '').replace(/"/g, '""')}"`,
      `"${c.profiles?.student_id || ''}"`,
      `"${c.departments?.name || 'Unassigned'}"`,
      `"${formatDate(c.created_at)}"`,
      `"${(c.resolution_message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campuscare_complaints_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-complaints-page">
      <div className="page-header-flex">
        <div>
          <h1>Complaint Management</h1>
          <p>
            Showing {complaints.length} complaint{complaints.length === 1 ? '' : 's'} based on selected filters
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn btn-secondary btn-sm"
          disabled={complaints.length === 0}
          title="Export CSV"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="filters-card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Complaint ID or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        <div className="filter-controls-row">
          {/* Status Filter */}
          <div className="filter-control">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-control">
            <label>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="filter-control">
            <label>Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-control">
            <label>Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <button
            type="button"
            className="sort-btn"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            <ArrowUpDown size={16} />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>

          {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || departmentFilter !== 'all') && (
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleClearFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="complaints-table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Loading complaints records...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No complaints found</h3>
            <p>No complaints match the current filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title & Location</th>
                  <th>Student Info</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => {
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
                          {item.profiles?.full_name || 'N/A'}
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
                          className="btn btn-primary btn-sm"
                        >
                          <span>Manage</span>
                          <ExternalLink size={12} />
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

