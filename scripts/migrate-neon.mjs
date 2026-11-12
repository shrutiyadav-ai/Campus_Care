import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Simple, secure SHA-256 password hash with salt
export function hashPassword(password) {
  const salt = 'campuscare_neon_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function migrate() {
  console.log('🔄 Updating Neon PostgreSQL schema for CampusCare...');

  // 1. Add password_hash to profiles if missing
  await sql`
    ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS password_hash TEXT;
  `;

  // 2. Ensure departments table
  await sql`
    CREATE TABLE IF NOT EXISTS departments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Insert standard departments
  await sql`
    INSERT INTO departments (name, description) VALUES
      ('Hostel Management', 'Manages hostel rooms, accommodations and block facilities'),
      ('Maintenance', 'Handles campus repairs, civil works and fixtures'),
      ('Housekeeping', 'Manages sanitation, waste disposal and campus cleanliness'),
      ('IT Support', 'Handles Wi-Fi, lab computers, networking and tech portals'),
      ('Electrical Department', 'Manages electrical power supply, lights, fans and ACs'),
      ('Transport Department', 'Handles university bus logistics, routes and transport queries'),
      ('Canteen Management', 'Manages dining halls, cafeteria hygiene and food standards'),
      ('Administration', 'Central student affairs and general university administration')
    ON CONFLICT (name) DO UPDATE SET is_active = true;
  `;

  // 3. Ensure complaints table
  await sql`
    CREATE TABLE IF NOT EXISTS complaints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      complaint_id TEXT NOT NULL UNIQUE,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'in_progress', 'resolved')),
      assigned_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
      resolution_message TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    );
  `;

  // 4. Ensure complaint_history
  await sql`
    CREATE TABLE IF NOT EXISTS complaint_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
      changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      old_status TEXT,
      new_status TEXT,
      remarks TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 5. Ensure notifications
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'status_update', 'assignment', 'resolution')),
      is_read BOOLEAN NOT NULL DEFAULT false,
      complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 6. Create default Administrator account if not exists
  const adminPasswordHash = hashPassword('Admin@1234');
  const studentPasswordHash = hashPassword('Student@1234');

  await sql`
    INSERT INTO profiles (full_name, student_id, email, phone, course, department, academic_year, role, password_hash)
    VALUES (
      'CampusCare Administrator',
      'ADM-001',
      'admin@university.edu',
      '+91 98765 00001',
      'Administration',
      'Central Administration',
      'Staff',
      'admin',
      ${adminPasswordHash}
    )
    ON CONFLICT (email) DO UPDATE SET 
      role = 'admin',
      password_hash = ${adminPasswordHash};
  `;
  console.log('✅ Admin account configured: admin@university.edu (Password: Admin@1234)');

  // 7. Create default Student account if not exists
  const studentRes = await sql`
    INSERT INTO profiles (full_name, student_id, email, phone, course, department, academic_year, role, password_hash)
    VALUES (
      'Aarav Sharma',
      'STU-2024-042',
      'student@university.edu',
      '+91 98765 43210',
      'B.Tech Computer Science',
      'Computer Science',
      '3rd Year',
      'student',
      ${studentPasswordHash}
    )
    ON CONFLICT (email) DO UPDATE SET 
      role = 'student',
      password_hash = ${studentPasswordHash}
    RETURNING id;
  `;
  console.log('✅ Student account configured: student@university.edu (Password: Student@1234)');

  const studentId = studentRes[0]?.id;

  // 8. Insert sample demonstration complaints if empty
  const countRes = await sql`SELECT count(*) FROM complaints;`;
  if (Number(countRes[0]?.count) === 0 && studentId) {
    const itDept = await sql`SELECT id FROM departments WHERE name = 'IT Support' LIMIT 1;`;
    const eleDept = await sql`SELECT id FROM departments WHERE name = 'Electrical Department' LIMIT 1;`;
    const hostDept = await sql`SELECT id FROM departments WHERE name = 'Hostel Management' LIMIT 1;`;

    // Complaint 1 (Resolved)
    const c1 = await sql`
      INSERT INTO complaints (complaint_id, user_id, title, category, location, description, priority, status, assigned_department_id, resolution_message, created_at, resolved_at)
      VALUES (
        'CC-20261112-0001',
        ${studentId},
        'Wi-Fi signal drops frequently in Hostel Block C 3rd Floor',
        'Wi-Fi & Internet',
        'Hostel Block C, Corridor 3B',
        'Students in rooms 301-315 are experiencing frequent packet loss and disconnects during evening study hours.',
        'high',
        'resolved',
        ${itDept[0]?.id},
        'Replaced faulty Cisco AP on ceiling 3B and updated channel frequency to 5GHz with renewed PoE switch.',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 day'
      )
      RETURNING id;
    `;

    // Complaint 2 (In Progress)
    await sql`
      INSERT INTO complaints (complaint_id, user_id, title, category, location, description, priority, status, assigned_department_id, created_at)
      VALUES (
        'CC-20261112-0002',
        ${studentId},
        'Air conditioner unit leaking water in Lab 304',
        'Classroom',
        'Engineering Block Lab 304',
        'The split AC in computer lab 304 has water dripping near terminal benches 12 to 16. Needs pipe drain clearing.',
        'urgent',
        'in_progress',
        ${eleDept[0]?.id},
        NOW() - INTERVAL '1 day'
      );
    `;

    // Complaint 3 (Under Review)
    await sql`
      INSERT INTO complaints (complaint_id, user_id, title, category, location, description, priority, status, assigned_department_id, created_at)
      VALUES (
        'CC-20261112-0003',
        ${studentId},
        'Water cooler tap damaged in Ground Floor Lobby',
        'Water Supply',
        'Hostel Block A Ground Floor',
        'The cold water outlet tap is loose and leaking continuously, causing water accumulation on the tile floor.',
        'medium',
        'under_review',
        ${hostDept[0]?.id},
        NOW() - INTERVAL '4 hours'
      );
    `;

    console.log('✅ Demonstration complaints initialized in Neon Postgres.');
  }

  console.log('🎉 Neon database setup complete!');
}

migrate().catch(console.error);

