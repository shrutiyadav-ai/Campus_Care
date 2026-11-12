import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Calendar,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { departmentService } from '../../services/departmentService';
import { formatDate } from '../../utils/constants';
import './Students.css';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentService.getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load registered student profiles.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.student_id || '').toLowerCase().includes(q) ||
      (s.course || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="students-page">
      <div className="page-header-flex">
        <div>
          <h1>Registered Students</h1>
          <p>Directory of all verified students enrolled on CampusCare</p>
        </div>
        <div className="student-count-badge">
          <Users size={16} />
          <span>{students.length} Total Enrolled</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="students-search-card">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by student name, ID, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="students-table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Loading student roster...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No students found</h3>
            <p>
              {searchQuery
                ? 'No students match your search criteria.'
                : 'No student accounts have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Email Address</th>
                  <th>Phone</th>
                  <th>Program / Course</th>
                  <th>Department</th>
                  <th>Academic Year</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-avatar-cell">
                        <div className="student-avatar-mini">
                          {student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="student-cell-name">
                          {student.full_name || 'Unnamed Student'}
                        </span>
                      </div>
                    </td>
                    <td className="mono-cell">
                      {student.student_id || 'Not Assigned'}
                    </td>
                    <td>
                      <div className="contact-cell">
                        <Mail size={13} />
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="phone-cell">
                        {student.phone || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="course-cell">
                        {student.course || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-gray">
                        {student.department || 'General'}
                      </span>
                    </td>
                    <td>
                      <span className="year-cell">
                        {student.academic_year || '—'}
                      </span>
                    </td>
                    <td className="date-cell">
                      <Calendar size={13} />
                      <span>{formatDate(student.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

