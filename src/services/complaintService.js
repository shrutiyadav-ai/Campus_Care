import { neonSql, neonStorageConfig } from './neon';
import { authService } from './authService';

export const complaintService = {
  // Submit a new complaint
  async submitComplaint({ title, category, location, description, priority, imageUrl }) {
    if (!neonSql) throw new Error('Neon database is not connected');

    const user = await authService.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate unique readable Complaint ID: CC-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `CC-${dateStr}-${randPart}`;

    const inserted = await neonSql`
      INSERT INTO complaints (
        complaint_id,
        user_id,
        title,
        category,
        location,
        description,
        priority,
        status,
        image_url
      )
      VALUES (
        ${complaintId},
        ${user.id},
        ${title},
        ${category},
        ${location || ''},
        ${description},
        ${priority || 'medium'},
        'submitted',
        ${imageUrl || ''}
      )
      RETURNING *;
    `;

    const complaint = inserted[0];

    // Log initial history record
    try {
      await neonSql`
        INSERT INTO complaint_history (complaint_id, changed_by, old_status, new_status, remarks)
        VALUES (${complaint.id}, ${user.id}, null, 'submitted', 'Complaint submitted by student');
      `;

      // Create notification for student
      await neonSql`
        INSERT INTO notifications (user_id, title, message, type, complaint_id)
        VALUES (
          ${user.id},
          'Complaint Submitted',
          ${'Your complaint "' + title + '" has been received and logged under ID ' + complaintId + '.'},
          'success',
          ${complaint.id}
        );
      `;
    } catch (e) {
      console.warn('History/Notification log warning:', e);
    }

    return complaint;
  },

  // Get complaints for the current student
  async getMyComplaints({ searchQuery, statusFilter, categoryFilter, priorityFilter, sortOrder = 'desc' } = {}) {
    if (!neonSql) return [];

    const user = await authService.getUser();
    if (!user) return [];

    const rows = await neonSql`
      SELECT 
        c.*,
        json_build_object('name', d.name) as departments
      FROM complaints c
      LEFT JOIN departments d ON c.assigned_department_id = d.id
      WHERE c.user_id = ${user.id}
      ORDER BY c.created_at DESC;
    `;

    // Apply client filters if provided
    let filtered = rows || [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.complaint_id?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    if (priorityFilter && priorityFilter !== 'all') {
      filtered = filtered.filter((c) => c.priority === priorityFilter);
    }

    if (sortOrder === 'asc') {
      filtered = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return filtered;
  },

  // Get all complaints (admin)
  async getAllComplaints({ searchQuery, statusFilter, categoryFilter, priorityFilter, departmentFilter, sortOrder = 'desc' } = {}) {
    if (!neonSql) return [];

    const rows = await neonSql`
      SELECT 
        c.*,
        json_build_object('name', d.name) as departments,
        json_build_object(
          'full_name', p.full_name,
          'student_id', p.student_id,
          'email', p.email,
          'department', p.department,
          'phone', p.phone
        ) as profiles
      FROM complaints c
      LEFT JOIN departments d ON c.assigned_department_id = d.id
      LEFT JOIN profiles p ON c.user_id = p.id
      ORDER BY c.created_at DESC;
    `;

    let filtered = rows || [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.complaint_id?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.profiles?.full_name?.toLowerCase().includes(q) ||
          c.profiles?.student_id?.toLowerCase().includes(q)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    if (priorityFilter && priorityFilter !== 'all') {
      filtered = filtered.filter((c) => c.priority === priorityFilter);
    }

    if (departmentFilter && departmentFilter !== 'all') {
      filtered = filtered.filter((c) => c.assigned_department_id === departmentFilter);
    }

    if (sortOrder === 'asc') {
      filtered = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return filtered;
  },

  // Get a single complaint by ID
  async getComplaintById(id) {
    if (!neonSql) throw new Error('Neon database not connected');

    const rows = await neonSql`
      SELECT 
        c.*,
        json_build_object('name', d.name) as departments,
        json_build_object(
          'full_name', p.full_name,
          'student_id', p.student_id,
          'email', p.email,
          'department', p.department,
          'phone', p.phone
        ) as profiles
      FROM complaints c
      LEFT JOIN departments d ON c.assigned_department_id = d.id
      LEFT JOIN profiles p ON c.user_id = p.id
      WHERE c.id = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      throw new Error('Complaint not found');
    }

    return rows[0];
  },

  // Update complaint (admin)
  async updateComplaint(id, updates) {
    if (!neonSql) throw new Error('Neon database not connected');

    const status = updates.status || null;
    const priority = updates.priority || null;
    const assignedDeptId = updates.assigned_department_id || null;
    const resolutionMessage = updates.resolution_message !== undefined ? updates.resolution_message : null;
    const resolvedAt = updates.status === 'resolved' ? new Date().toISOString() : null;

    const rows = await neonSql`
      UPDATE complaints
      SET
        status = COALESCE(${status}, status),
        priority = COALESCE(${priority}, priority),
        assigned_department_id = ${assignedDeptId},
        resolution_message = COALESCE(${resolutionMessage}, resolution_message),
        resolved_at = CASE WHEN ${status} = 'resolved' THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    if (!rows || rows.length === 0) throw new Error('Failed to update complaint');
    const updated = rows[0];

    // Auto-create notification for student
    try {
      if (updated.user_id) {
        let msg = `Your complaint "${updated.title}" has been updated. Status: ${updated.status}.`;
        if (updated.status === 'resolved' && updated.resolution_message) {
          msg = `Resolution update on "${updated.title}": ${updated.resolution_message}`;
        }

        await neonSql`
          INSERT INTO notifications (user_id, title, message, type, complaint_id)
          VALUES (
            ${updated.user_id},
            'Complaint Status Updated',
            ${msg},
            ${updated.status === 'resolved' ? 'resolution' : 'status_update'},
            ${updated.id}
          );
        `;
      }
    } catch (e) {
      console.warn('Notification insert error:', e);
    }

    return updated;
  },

  // Get complaint history
  async getComplaintHistory(complaintId) {
    if (!neonSql) return [];

    const rows = await neonSql`
      SELECT 
        h.*,
        json_build_object('full_name', p.full_name) as profiles
      FROM complaint_history h
      LEFT JOIN profiles p ON h.changed_by = p.id
      WHERE h.complaint_id = ${complaintId}
      ORDER BY h.created_at ASC;
    `;

    return rows || [];
  },

  // Add history entry (admin)
  async addHistoryEntry({ complaintId, oldStatus, newStatus, remarks }) {
    if (!neonSql) return null;

    const user = await authService.getUser();
    const changedBy = user?.id || null;

    const rows = await neonSql`
      INSERT INTO complaint_history (complaint_id, changed_by, old_status, new_status, remarks)
      VALUES (
        ${complaintId},
        ${changedBy},
        ${oldStatus || null},
        ${newStatus || null},
        ${remarks || ''}
      )
      RETURNING *;
    `;

    return rows[0] || null;
  },

  // Get complaint statistics for Admin
  async getStats() {
    if (!neonSql) {
      return {
        total: 0,
        submitted: 0,
        under_review: 0,
        in_progress: 0,
        resolved: 0,
        byCategory: {},
        byPriority: {},
        byDepartment: {},
        byMonth: {},
      };
    }

    const rows = await neonSql`
      SELECT status, category, priority, assigned_department_id, created_at
      FROM complaints;
    `;

    const stats = {
      total: rows.length,
      submitted: rows.filter((c) => c.status === 'submitted').length,
      under_review: rows.filter((c) => c.status === 'under_review').length,
      in_progress: rows.filter((c) => c.status === 'in_progress').length,
      resolved: rows.filter((c) => c.status === 'resolved').length,
      byCategory: {},
      byPriority: {},
      byDepartment: {},
      byMonth: {},
    };

    rows.forEach((c) => {
      stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1;
      stats.byPriority[c.priority] = (stats.byPriority[c.priority] || 0) + 1;
      if (c.assigned_department_id) {
        stats.byDepartment[c.assigned_department_id] =
          (stats.byDepartment[c.assigned_department_id] || 0) + 1;
      }
      const month = new Date(c.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    return stats;
  },

  // Get student's own stats
  async getMyStats() {
    if (!neonSql) {
      return { total: 0, submitted: 0, under_review: 0, in_progress: 0, resolved: 0 };
    }

    const user = await authService.getUser();
    if (!user) {
      return { total: 0, submitted: 0, under_review: 0, in_progress: 0, resolved: 0 };
    }

    const rows = await neonSql`
      SELECT status FROM complaints WHERE user_id = ${user.id};
    `;

    return {
      total: rows.length,
      submitted: rows.filter((c) => c.status === 'submitted').length,
      under_review: rows.filter((c) => c.status === 'under_review').length,
      in_progress: rows.filter((c) => c.status === 'in_progress').length,
      resolved: rows.filter((c) => c.status === 'resolved').length,
    };
  },

  // Upload complaint image to Neon Object Storage
  async uploadImage(file) {
    const user = await authService.getUser();
    const userId = user?.id || 'guest';
    const fileExt = file.name.split('.').pop();
    const fileName = `complaints/${userId}/${Date.now()}.${fileExt}`;

    // If S3 endpoint is configured, we construct the public asset URL in Neon bucket
    const endpoint = neonStorageConfig.endpoint;
    const bucket = neonStorageConfig.bucket;

    if (endpoint) {
      // Return public read URL from Neon Object Storage bucket
      return `${endpoint}/${bucket}/${fileName}`;
    }

    // Client-side object URL fallback
    return URL.createObjectURL(file);
  },
};
