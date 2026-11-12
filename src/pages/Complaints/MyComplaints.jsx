import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  formatDate,
  getStatusInfo,
  getPriorityInfo,
} from '../../utils/constants';
import './MyComplaints.css';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter, sortOrder]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getMyComplaints({
        searchQuery: searchQuery.trim(),
        statusFilter,
        categoryFilter,
        priorityFilter,
        sortOrder,
      });
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to fetch your complaints. Please try again.');
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
    setSortOrder('desc');
  };

  return (
    <div className="my-complaints-page">
      <div className="page-header-flex">
        <div>
          <h1>My Complaints</h1>
          <p>View, search, and track all complaints you have lodged.</p>
        </div>
        <Link to="/student/raise-complaint" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>New Complaint</span>
        </Link>
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
            title="Toggle sort direction"
          >
            <ArrowUpDown size={16} />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints List / Table */}
      <div className="complaints-content-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Fetching complaints...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No complaints found</h3>
            <p>
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters or search keywords.'
                : 'You have not submitted any complaints yet.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
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
                        <Link to={`/student/complaints/${item.id}`} className="id-link">
                          {item.complaint_id}
                        </Link>
                      </td>
                      <td className="title-cell">
                        <strong>{item.title}</strong>
                        {item.location && (
                          <span className="location-text">{item.location}</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-gray">{item.category}</span>
                      </td>
                      <td>
                        <span className="dept-text">
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
                          to={`/student/complaints/${item.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          <span>Track</span>
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

