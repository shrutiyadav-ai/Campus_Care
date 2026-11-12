import { neonSql } from './neon';

const SALT = 'campuscare_neon_salt_2026';
const SESSION_KEY = 'campuscare_neon_user_session';

// Client-side SHA-256 hash using native Web Crypto API
async function hashPasswordBrowser(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  // Register a new student
  async register({ email, password, fullName, studentId, phone, course, department, academicYear }) {
    if (!neonSql) {
      throw new Error('Neon database is not connected. Please check DATABASE_URL.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await neonSql`
      SELECT id FROM profiles WHERE email = ${cleanEmail} LIMIT 1;
    `;

    if (existing && existing.length > 0) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const passwordHash = await hashPasswordBrowser(password);

    const inserted = await neonSql`
      INSERT INTO profiles (
        full_name,
        student_id,
        email,
        phone,
        course,
        department,
        academic_year,
        role,
        password_hash
      )
      VALUES (
        ${fullName.trim()},
        ${studentId.trim()},
        ${cleanEmail},
        ${phone.trim() || ''},
        ${course.trim() || ''},
        ${department.trim() || ''},
        ${academicYear || ''},
        'student',
        ${passwordHash}
      )
      RETURNING id, full_name, student_id, email, phone, course, department, academic_year, role, created_at;
    `;

    const user = inserted[0];
    return { user };
  },

  // Login
  async login({ email, password }) {
    if (!neonSql) {
      throw new Error('Neon database is not connected. Please check DATABASE_URL.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const rows = await neonSql`
      SELECT id, full_name, student_id, email, phone, course, department, academic_year, role, password_hash
      FROM profiles
      WHERE email = ${cleanEmail}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const profile = rows[0];
    const computedHash = await hashPasswordBrowser(password);

    if (profile.password_hash !== computedHash) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    // Save session
    const sessionUser = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    // Return profile without sensitive password hash
    const safeProfile = { ...profile };
    delete safeProfile.password_hash;

    return { user: sessionUser, profile: safeProfile };
  },

  // Logout
  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  // Get current session
  async getSession() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored);
      return { user };
    } catch (e) {
      return null;
    }
  },

  // Get current user
  async getUser() {
    const session = await this.getSession();
    return session?.user || null;
  },

  // Get user profile from profiles table
  async getProfile(userId) {
    if (!neonSql || !userId) return null;
    const rows = await neonSql`
      SELECT id, full_name, student_id, email, phone, course, department, academic_year, role, created_at, updated_at
      FROM profiles
      WHERE id = ${userId}
      LIMIT 1;
    `;
    return rows[0] || null;
  },

  // Update profile
  async updateProfile(userId, updates) {
    if (!neonSql || !userId) throw new Error('Not authenticated');

    const fullName = updates.full_name !== undefined ? updates.full_name : null;
    const phone = updates.phone !== undefined ? updates.phone : null;
    const course = updates.course !== undefined ? updates.course : null;
    const academicYear = updates.academic_year !== undefined ? updates.academic_year : null;

    const rows = await neonSql`
      UPDATE profiles
      SET 
        full_name = COALESCE(${fullName}, full_name),
        phone = COALESCE(${phone}, phone),
        course = COALESCE(${course}, course),
        academic_year = COALESCE(${academicYear}, academic_year),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, full_name, student_id, email, phone, course, department, academic_year, role, created_at, updated_at;
    `;

    if (!rows || rows.length === 0) throw new Error('Failed to update profile');
    return rows[0];
  },

  // Reset password
  async resetPassword(email) {
    if (!neonSql) throw new Error('Neon database is not connected');
    const cleanEmail = email.trim().toLowerCase();
    const rows = await neonSql`SELECT id FROM profiles WHERE email = ${cleanEmail};`;
    if (!rows || rows.length === 0) {
      throw new Error('No account found with this email address.');
    }
    // Simulation: In a production portal this sends an email with a token
    return { success: true };
  },

  // Update password
  async updatePassword(newPassword) {
    const user = await this.getUser();
    if (!user || !neonSql) throw new Error('Not authenticated');

    const newHash = await hashPasswordBrowser(newPassword);
    await neonSql`
      UPDATE profiles
      SET password_hash = ${newHash}, updated_at = NOW()
      WHERE id = ${user.id};
    `;
    return { success: true };
  },

  onAuthStateChange(callback) {
    // Return unsubscribe handler
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};
