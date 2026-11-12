import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function test() {
  try {
    const version = await sql`SELECT version();`;
    console.log('✅ Neon Postgres connected successfully!');
    console.log('Postgres Version:', version[0].version);

    // Create schema tables for CampusCare
    console.log('Applying CampusCare schema to Neon Postgres...');

    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name TEXT NOT NULL DEFAULT '',
        student_id TEXT,
        email TEXT NOT NULL UNIQUE,
        phone TEXT DEFAULT '',
        course TEXT DEFAULT '',
        department TEXT DEFAULT '',
        academic_year TEXT DEFAULT '',
        role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT DEFAULT '',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      INSERT INTO departments (name, description) VALUES
        ('Hostel Management', 'Manages hostel facilities, rooms, and accommodations'),
        ('Maintenance', 'Handles general maintenance and repair work'),
        ('Housekeeping', 'Manages cleaning and sanitation services'),
        ('IT Support', 'Handles Wi-Fi, internet, and technology issues'),
        ('Electrical Department', 'Manages electrical systems and power supply'),
        ('Transport Department', 'Handles university transport services'),
        ('Canteen Management', 'Manages cafeteria and food services'),
        ('Administration', 'General university administration')
      ON CONFLICT (name) DO NOTHING;
    `;

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

    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('✅ Database tables verified:', tables.map(t => t.table_name));

    const depts = await sql`SELECT count(*) FROM departments;`;
    console.log('✅ Default departments preloaded:', depts[0].count);
  } catch (err) {
    console.error('❌ Database error:', err);
    process.exit(1);
  }
}

test();

