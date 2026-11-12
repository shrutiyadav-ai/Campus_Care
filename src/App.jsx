import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';

// Student Portal Pages
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import StudentOverview from './pages/StudentDashboard/Overview';
import RaiseComplaint from './pages/Complaints/RaiseComplaint';
import MyComplaints from './pages/Complaints/MyComplaints';
import ComplaintDetail from './pages/Complaints/ComplaintDetail';
import Profile from './pages/Profile/Profile';
import HelpSupport from './pages/StudentDashboard/HelpSupport';

// Admin Portal Pages
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminOverview from './pages/AdminDashboard/AdminOverview';
import AdminComplaints from './pages/AdminDashboard/AdminComplaints';
import Students from './pages/AdminDashboard/Students';
import Departments from './pages/Departments/Departments';
import Analytics from './pages/Analytics/Analytics';

// Notifications
import Notifications from './pages/Notifications/Notifications';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentOverview />} />
            <Route path="raise-complaint" element={<RaiseComplaint />} />
            <Route path="complaints" element={<MyComplaints />} />
            <Route path="complaints/:id" element={<ComplaintDetail />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="help" element={<HelpSupport />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="complaints/pending" element={<AdminComplaints presetStatus="submitted" />} />
            <Route path="complaints/in-progress" element={<AdminComplaints presetStatus="in_progress" />} />
            <Route path="complaints/resolved" element={<AdminComplaints presetStatus="resolved" />} />
            <Route path="complaints/:id" element={<ComplaintDetail />} />
            <Route path="students" element={<Students />} />
            <Route path="departments" element={<Departments />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
