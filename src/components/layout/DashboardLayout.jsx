import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

export default function DashboardLayout({ sidebarItems, title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let unsubscribe = null;

    async function fetchUnread() {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to get notification count:', err);
      }
    }

    if (user?.id) {
      fetchUnread();
      unsubscribe = notificationService.subscribeToNotifications(user.id, () => {
        fetchUnread();
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id, location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const notificationsPath = isAdmin ? '/admin/notifications' : '/student/notifications';
  const profilePath = isAdmin ? '/admin/profile' : '/student/profile';

  return (
    <div className="dashboard-layout">
      <Sidebar
        items={sidebarItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle navigation"
            >
              <Menu size={22} />
            </button>
            <h1 className="header-page-title">{title || 'Dashboard'}</h1>
          </div>

          <div className="header-right">
            {/* Notification Bell */}
            <Link
              to={notificationsPath}
              className="notification-btn"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown */}
            <div className="user-menu-container">
              <button
                className="user-profile-trigger"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
              >
                <div className="user-avatar-circle">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details hide-mobile">
                  <span className="user-display-name">
                    {profile?.full_name || user?.email || 'User'}
                  </span>
                  <span className="user-role-label">
                    {profile?.role === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                </div>
                <ChevronDown size={16} className="chevron-icon" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="dropdown-overlay"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-header">
                      <p className="dropdown-name">{profile?.full_name || 'User'}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to={profilePath}
                      className="dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                    <button
                      className="dropdown-item logout-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="dashboard-content-area">
          {children}
        </main>
      </div>
    </div>
  );
}

