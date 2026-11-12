# CampusCare – University Complaint Management Portal (Powered by Neon)

CampusCare is a centralized university complaint management platform built with React, Vite, and **Neon Serverless Cloud Infrastructure**. It enables students to report campus-related grievances across 11 categories (Hostel, Wi-Fi, Water Supply, Electricity, Maintenance, Canteen, etc.), track real-time resolution status with transparent audit logs, and allows university administrators to assign departments, update statuses, manage departments, and analyze performance reports.

---

## ⚡ Neon Cloud Architecture

The entire platform runs on Neon:
1. **Neon Serverless Postgres**: High-performance PostgreSQL database powered by `@neondatabase/serverless` using pooled connections (`DATABASE_URL`).
2. **Neon Auth**: Authentication via JWKS endpoint (`NEON_AUTH_JWKS_URL`) and secure password hashing.
3. **Neon Serverless Functions**: Cloud function runtime (`hello` function endpoint).
4. **Neon Object Storage**: S3-compatible asset and evidence storage (Bucket `assets`).
5. **Neon AI Gateway**: Model routing and AI inference endpoint (`NEON_AI_GATEWAY_BASE_URL`).
6. **Neon Realtime**: Live WebSocket communication (`NEON_REALTIME_URL`).

---

## 🔑 Pre-Configured Demonstration Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@university.edu` | `Admin@1234` |
| **Student** | `student@university.edu` | `Student@1234` |

*(Students can also self-register at `/register`)*

---

## 🚀 Live Demonstration Walkthrough

### 1. Student Workflow
1. **Landing Page (`/`)**: View university stats fetched dynamically from Neon Postgres, 11 categories, 3-step workflow, and features.
2. **Registration (`/register`)**: Register with University Email, Student ID, Course, Department, Academic Year, and Password. Automatically stored in Neon Postgres `profiles`.
3. **Login (`/login`)**: Authenticate against Neon Postgres credentials.
4. **Student Dashboard (`/student/dashboard`)**:
   - Welcome banner and real-time count of total, pending, in-progress, and resolved complaints.
   - Recent complaints table with colored priority and status badges.
5. **Lodge Complaint (`/student/raise-complaint`)**:
   - Title, Category, Location, Priority (Low/Medium/High/Urgent), Detailed Description, and optional Photo Evidence attachment.
   - Auto-generates unique human-readable Complaint ID (e.g. `CC-20261112-9328`).
6. **Track Progress (`/student/complaints`)**:
   - Filter by status, category, and priority.
   - Search by Complaint ID or title.
   - Visual 4-step Timeline: **Submitted → Under Review → In Progress → Resolved** with audit timestamps.
7. **Profile (`/student/profile`)**: Update name, phone, course, and academic year while keeping student ID and email secure.
8. **Help & Support (`/student/help`)**: Interactive FAQ accordion and grievance cell emergency contacts.
9. **Notifications (`/student/notifications`)**: Real-time notifications on status updates, department assignments, and resolution notes.

### 2. Administrator Workflow
1. **Admin Login (`/login`)**: Authenticates via `admin@university.edu`; role-based routing directs admin to `/admin/dashboard`.
2. **Executive Overview (`/admin/dashboard`)**:
   - **Neon Cloud Infrastructure Status Banner**: Real-time live status for all 6 Neon services + "Test Neon Function" button.
   - 6 KPI metric cards: Total Complaints, Pending Review, In Progress, Resolved, Registered Students, Active Departments.
   - Interactive Recharts data visualizations: Category Distribution (Bar Chart) and Priority Severity (Donut Pie Chart).
   - Recent complaints action table.
3. **All Complaints Management (`/admin/complaints`)**:
   - Filter by Status, Category, Priority, and Assigned Department.
   - Search by ID or keyword.
   - One-click **Export to CSV**.
4. **Complaint Action Panel (`/admin/complaints/:id`)**:
   - Review student details (Name, ID, Department, Email, Phone).
   - Change Status (Submitted / Under Review / In Progress / Resolved).
   - Assign to Department (e.g., Hostel Management, IT Support, Electrical).
   - Enter Official Resolution Message (visible to student).
   - Add Internal Activity Remarks.
   - Full audit history log.
5. **Department Management (`/admin/departments`)**:
   - Add new resolution departments.
   - Edit department descriptions.
   - Toggle departments Active / Inactive.
   - View assigned issue counts.
6. **Students Directory (`/admin/students`)**:
   - Searchable roster of enrolled students.
7. **Reports & Analytics (`/admin/analytics`)**:
   - Date range filtering (From Date - To Date).
   - Calculated Resolution Rate %.
   - Horizontal category breakdown, monthly influx trend lines, and department workloads.
   - Export Analytical Report to CSV.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, JavaScript, CSS3 (Light theme modern SaaS design, Inter typography)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Utilities**: Date-fns
- **Routing**: React Router v7
- **Backend & Cloud Platform**: Neon (Postgres, Auth, Functions, Object Storage, AI Gateway, Realtime)
- **Database Driver**: `@neondatabase/serverless`
- **Deployment**: Vercel ready (includes `vercel.json` SPA rewrite rules)

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. In **Project Settings → Environment Variables**, add the variables from `.env.local`:
   - `DATABASE_URL`
   - `VITE_NEON_DATABASE_URL`
   - `VITE_NEON_AUTH_BASE_URL`
   - `VITE_NEON_FUNCTION_URL`
   - `VITE_NEON_REALTIME_URL`
   - `VITE_AWS_ENDPOINT_URL_S3`
   - `VITE_AWS_REGION`
   - `VITE_NEON_AI_GATEWAY_BASE_URL`
4. Deploy!
