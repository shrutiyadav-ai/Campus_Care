import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  User,
  HelpCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const studentNavItems = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    path: '/student/dashboard',
    end: true,
  },
  {
    icon: PlusCircle,
    label: 'Raise Complaint',
    path: '/student/raise-complaint',
  },
  {
    icon: FileText,
    label: 'My Complaints',
    path: '/student/complaints',
  },
  {
    icon: Bell,
    label: 'Notifications',
    path: '/student/notifications',
  },
  {
    icon: User,
    label: 'My Profile',
    path: '/student/profile',
  },
  {
    icon: HelpCircle,
    label: 'Help & Support',
    path: '/student/help',
  },
];

export default function StudentDashboard() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/raise-complaint')) return 'Raise a Complaint';
    if (pathname.includes('/complaints/') && pathname.split('/').length > 3) return 'Complaint Details';
    if (pathname.includes('/complaints')) return 'My Complaints';
    if (pathname.includes('/notifications')) return 'Notifications';
    if (pathname.includes('/profile')) return 'My Profile';
    if (pathname.includes('/help')) return 'Help & Support';
    return 'Student Portal';
  };

  return (
    <DashboardLayout
      sidebarItems={studentNavItems}
      title={getPageTitle(location.pathname)}
    >
      <Outlet />
    </DashboardLayout>
  );
}

