import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Loader,
  CheckCircle,
  Users,
  Building2,
  BarChart3,
  Bell,
  User,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const adminNavItems = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    path: '/admin/dashboard',
    end: true,
  },
  {
    icon: FileText,
    label: 'All Complaints',
    path: '/admin/complaints',
    end: true,
  },
  {
    icon: Clock,
    label: 'Pending Review',
    path: '/admin/complaints/pending',
  },
  {
    icon: Loader,
    label: 'In Progress',
    path: '/admin/complaints/in-progress',
  },
  {
    icon: CheckCircle,
    label: 'Resolved',
    path: '/admin/complaints/resolved',
  },
  {
    icon: Users,
    label: 'Students',
    path: '/admin/students',
  },
  {
    icon: Building2,
    label: 'Departments',
    path: '/admin/departments',
  },
  {
    icon: BarChart3,
    label: 'Reports & Analytics',
    path: '/admin/analytics',
  },
  {
    icon: Bell,
    label: 'Notifications',
    path: '/admin/notifications',
  },
  {
    icon: User,
    label: 'My Profile',
    path: '/admin/profile',
  },
];

export default function AdminDashboard() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/complaints/pending')) return 'Pending Complaints';
    if (pathname.includes('/complaints/in-progress')) return 'Complaints In Progress';
    if (pathname.includes('/complaints/resolved')) return 'Resolved Complaints';
    if (pathname.includes('/complaints/') && pathname.split('/').length > 3) return 'Complaint Review & Action';
    if (pathname.includes('/complaints')) return 'All Campus Complaints';
    if (pathname.includes('/students')) return 'Registered Students';
    if (pathname.includes('/departments')) return 'University Departments';
    if (pathname.includes('/analytics')) return 'Reports & Analytics';
    if (pathname.includes('/notifications')) return 'Admin Notifications';
    if (pathname.includes('/profile')) return 'Admin Profile';
    return 'Admin Dashboard';
  };

  return (
    <DashboardLayout
      sidebarItems={adminNavItems}
      title={getPageTitle(location.pathname)}
    >
      <Outlet />
    </DashboardLayout>
  );
}

