import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Loader2,
  X,
  Save,
} from 'lucide-react';
import { departmentService } from '../../services/departmentService';
import { complaintService } from '../../services/complaintService';
import './Departments.css';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [deptComplaintCounts, setDeptComplaintCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [modalName, setModalName] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [depts, stats] = await Promise.all([
        departmentService.getDepartments(),
        complaintService.getStats(),
      ]);

      setDepartments(depts);
      setDeptComplaintCounts(stats.byDepartment || {});
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDept(null);
    setModalName('');
    setModalDesc('');
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setModalName(dept.name);
    setModalDesc(dept.description || '');
    setModalOpen(true);
  };

  const handleToggleActive = async (dept) => {
    try {
      const updated = await departmentService.toggleDepartment(dept.id, !dept.is_active);
      setDepartments((prev) =>
        prev.map((d) => (d.id === dept.id ? { ...d, is_active: !d.is_active } : d))
      );
      setSuccess(`Department "${dept.name}" ${!dept.is_active ? 'activated' : 'deactivated'}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to toggle department:', err);
      setError('Could not change department status.');
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalName.trim()) {
      setError('Department name is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingDept) {
        // Edit existing
        const updated = await departmentService.updateDepartment(editingDept.id, {
          name: modalName.trim(),
          description: modalDesc.trim(),
        });
        setDepartments((prev) =>
          prev.map((d) => (d.id === editingDept.id ? updated : d))
        );
        setSuccess('Department updated successfully.');
      } else {
        // Add new
        const created = await departmentService.addDepartment({
          name: modalName.trim(),
          description: modalDesc.trim(),
        });
        setDepartments((prev) => [...prev, created]);
        setSuccess('New department added successfully.');
      }

      setModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Save department error:', err);
      setError(err.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="departments-page">
      <div className="page-header-flex">
        <div>
          <h1>Department Management</h1>
          <p>Configure university administrative departments handling campus issues</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Departments Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Loading departments...</span>
        </div>
      ) : departments.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <h3>No departments configured</h3>
          <p>Click "Add Department" to create the first resolution department.</p>
        </div>
      ) : (
        <div className="departments-grid">
          {departments.map((dept) => {
            const count = deptComplaintCounts[dept.id] || 0;
            return (
              <div
                key={dept.id}
                className={`department-card ${!dept.is_active ? 'inactive' : ''}`}
              >
                <div className="dept-card-top">
                  <div className="dept-icon-box">
                    <Building2 size={22} />
                  </div>
                  <div className="dept-status-toggle">
                    <span
                      className={`badge ${
                        dept.is_active ? 'badge-green' : 'badge-gray'
                      }`}
                    >
                      {dept.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <h3 className="dept-card-title">{dept.name}</h3>
                <p className="dept-card-desc">
                  {dept.description || 'No description provided.'}
                </p>

                <div className="dept-card-footer">
                  <div className="dept-stat">
                    <FileText size={15} />
                    <span>{count} Assigned Issue{count === 1 ? '' : 's'}</span>
                  </div>

                  <div className="dept-actions">
                    <button
                      className="dept-icon-btn"
                      onClick={() => openEditModal(dept)}
                      title="Edit Department"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className={`dept-toggle-btn ${dept.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                      onClick={() => handleToggleActive(dept)}
                      title={dept.is_active ? 'Deactivate department' : 'Activate department'}
                    >
                      {dept.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{editingDept ? 'Edit Department' : 'Create New Department'}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="modalName">
                  Department Name <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  id="modalName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Electrical Department"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modalDesc">
                  Description / Responsibilities
                </label>
                <textarea
                  id="modalDesc"
                  className="form-input"
                  placeholder="Explain what campus grievances this department handles..."
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  disabled={saving}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{editingDept ? 'Update' : 'Create'} Department</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

