import { neonSql } from './neon';

export const departmentService = {
  // Get all departments
  async getDepartments(onlyActive = false) {
    if (!neonSql) return [];

    const rows = onlyActive
      ? await neonSql`SELECT * FROM departments WHERE is_active = true ORDER BY name ASC;`
      : await neonSql`SELECT * FROM departments ORDER BY name ASC;`;

    return rows || [];
  },

  // Add department
  async addDepartment({ name, description }) {
    if (!neonSql) throw new Error('Neon database not connected');

    const rows = await neonSql`
      INSERT INTO departments (name, description, is_active)
      VALUES (${name}, ${description || ''}, true)
      RETURNING *;
    `;

    return rows[0] || null;
  },

  // Update department
  async updateDepartment(id, updates) {
    if (!neonSql) throw new Error('Neon database not connected');

    const name = updates.name !== undefined ? updates.name : null;
    const description = updates.description !== undefined ? updates.description : null;
    const isActive = updates.is_active !== undefined ? updates.is_active : null;

    const rows = await neonSql`
      UPDATE departments
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        is_active = COALESCE(${isActive}, is_active)
      WHERE id = ${id}
      RETURNING *;
    `;

    return rows[0] || null;
  },

  // Toggle department active status
  async toggleDepartment(id, isActive) {
    return this.updateDepartment(id, { is_active: isActive });
  },

  // Delete department
  async deleteDepartment(id) {
    if (!neonSql) return;
    await neonSql`DELETE FROM departments WHERE id = ${id};`;
  },

  // Get complaints for a department
  async getDepartmentComplaints(departmentId) {
    if (!neonSql) return [];

    const rows = await neonSql`
      SELECT * FROM complaints 
      WHERE assigned_department_id = ${departmentId} 
      ORDER BY created_at DESC;
    `;

    return rows || [];
  },

  // Get all students
  async getStudents() {
    if (!neonSql) return [];

    const rows = await neonSql`
      SELECT id, full_name, student_id, email, phone, course, department, academic_year, role, created_at 
      FROM profiles 
      WHERE role = 'student' 
      ORDER BY created_at DESC;
    `;

    return rows || [];
  },

  // Get student count
  async getStudentCount() {
    if (!neonSql) return 0;

    const rows = await neonSql`
      SELECT count(*) FROM profiles WHERE role = 'student';
    `;

    return Number(rows[0]?.count) || 0;
  },
};
