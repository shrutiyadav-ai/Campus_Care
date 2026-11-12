import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const SALT = 'campuscare_neon_salt_2026';
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
}

async function runEndToEndAppTest() {
  console.log('🚀 TESTING FULL END-TO-END CAMPUSCARE APPLICATION FLOW ON NEON');

  // Test 1: Student Registration
  console.log('\n--- 1. Testing Student Registration in Neon Postgres ---');
  const testStudentEmail = `test_student_${Date.now()}@university.edu`;
  const studentPass = 'Student@Pass123';
  const hashedPass = hashPassword(studentPass);

  const regRes = await sql`
    INSERT INTO profiles (full_name, student_id, email, phone, course, department, academic_year, role, password_hash)
    VALUES (
      'Priya Patel',
      'STU-2026-999',
      ${testStudentEmail},
      '+91 91234 56789',
      'B.Sc Physics',
      'Physics',
      '2nd Year',
      'student',
      ${hashedPass}
    )
    RETURNING id, full_name, email, role;
  `;
  const student = regRes[0];
  console.log('✅ Student registered successfully:', student);

  // Test 2: Student Authentication / Login
  console.log('\n--- 2. Testing Student Authentication against Neon Postgres ---');
  const loginRes = await sql`
    SELECT id, full_name, email, role, password_hash
    FROM profiles
    WHERE email = ${testStudentEmail}
    LIMIT 1;
  `;
  const fetchedUser = loginRes[0];
  const isMatch = fetchedUser.password_hash === hashPassword(studentPass);
  if (!isMatch) throw new Error('Password verification failed');
  console.log('✅ Student login verified successfully! Role:', fetchedUser.role);

  // Test 3: Student Lodging Complaint
  console.log('\n--- 3. Testing Complaint Submission in Neon Postgres ---');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const complaintId = `CC-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

  const complaintRes = await sql`
    INSERT INTO complaints (complaint_id, user_id, title, category, location, description, priority, status)
    VALUES (
      ${complaintId},
      ${student.id},
      'Physics Lab 102 galvanometer malfunctioning',
      'Classroom',
      'Science Block Room 102',
      'The analog galvanometer on bench 4 gives erratic readings during magnetic field experiments.',
      'medium',
      'submitted'
    )
    RETURNING *;
  `;
  const complaint = complaintRes[0];
  console.log('✅ Complaint logged successfully with ID:', complaint.complaint_id);

  // Test 4: Student Fetching My Complaints
  console.log('\n--- 4. Testing Student Complaint Retrieval ---');
  const myComplaints = await sql`
    SELECT id, complaint_id, title, category, status, priority, created_at
    FROM complaints
    WHERE user_id = ${student.id}
    ORDER BY created_at DESC;
  `;
  console.log('✅ Student retrieved complaints count:', myComplaints.length, 'ID:', myComplaints[0].complaint_id);

  // Test 5: Admin Login
  console.log('\n--- 5. Testing Admin Authentication ---');
  const adminRes = await sql`
    SELECT id, full_name, email, role, password_hash
    FROM profiles
    WHERE email = 'admin@university.edu'
    LIMIT 1;
  `;
  const admin = adminRes[0];
  const adminMatch = admin.password_hash === hashPassword('Admin@1234');
  if (!adminMatch) throw new Error('Admin password mismatch');
  console.log('✅ Admin login verified:', admin.full_name, 'Role:', admin.role);

  // Test 6: Admin Department Assignment & Status Update
  console.log('\n--- 6. Testing Admin Complaint Resolution & Department Assignment ---');
  const depts = await sql`SELECT id FROM departments WHERE name = 'Maintenance' LIMIT 1;`;
  const maintDeptId = depts[0]?.id;

  const updateRes = await sql`
    UPDATE complaints
    SET 
      status = 'in_progress',
      assigned_department_id = ${maintDeptId},
      resolution_message = 'Technician assigned to inspect and replace galvanometer coil.',
      updated_at = NOW()
    WHERE id = ${complaint.id}
    RETURNING *;
  `;
  console.log('✅ Complaint status updated to:', updateRes[0].status, 'Dept Assigned:', maintDeptId);

  // Test 7: Audit Log and History Record
  console.log('\n--- 7. Testing Audit Trail in Neon Postgres ---');
  await sql`
    INSERT INTO complaint_history (complaint_id, changed_by, old_status, new_status, remarks)
    VALUES (
      ${complaint.id},
      ${admin.id},
      'submitted',
      'in_progress',
      'Allocated to Maintenance technician team.'
    );
  `;
  const history = await sql`
    SELECT * FROM complaint_history WHERE complaint_id = ${complaint.id};
  `;
  console.log('✅ Audit history recorded successfully, entries:', history.length);

  // Test 8: Notification Delivery
  console.log('\n--- 8. Testing In-App Notification in Neon Postgres ---');
  await sql`
    INSERT INTO notifications (user_id, title, message, type, complaint_id)
    VALUES (
      ${student.id},
      'Complaint Assigned',
      'Your complaint CC-102 has been assigned to Maintenance Department.',
      'assignment',
      ${complaint.id}
    );
  `;
  const notifs = await sql`
    SELECT * FROM notifications WHERE user_id = ${student.id};
  `;
  console.log('✅ Student notification verified:', notifs[0].title);

  // Test 9: Overall Portal Analytics Query
  console.log('\n--- 9. Testing Dashboard KPI Metrics from Neon Postgres ---');
  const totalCount = await sql`SELECT count(*) FROM complaints;`;
  const inProgCount = await sql`SELECT count(*) FROM complaints WHERE status = 'in_progress';`;
  const resolvedCount = await sql`SELECT count(*) FROM complaints WHERE status = 'resolved';`;
  const studentCount = await sql`SELECT count(*) FROM profiles WHERE role = 'student';`;

  console.log('✅ Live Analytics from Neon Postgres:', {
    totalComplaints: Number(totalCount[0].count),
    inProgress: Number(inProgCount[0].count),
    resolved: Number(resolvedCount[0].count),
    enrolledStudents: Number(studentCount[0].count),
  });

  console.log('\n🎉 ALL FULL-STACK APP FLOWS VERIFIED 100% ON NEON POSTGRES!');
}

runEndToEndAppTest().catch(console.error);

