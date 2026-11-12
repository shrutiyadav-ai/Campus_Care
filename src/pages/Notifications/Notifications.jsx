import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  UserCheck,
  CheckCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import './Notifications.css';

export default function Notifications() {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();

    let unsubscribe = null;
    if (user?.id) {
      unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'resolution':
        return <CheckCircle2 size={18} className="icon-green" />;
      case 'status_update':
        return <MessageSquare size={18} className="icon-blue" />;
      case 'assignment':
        return <UserCheck size={18} className="icon-purple" />;
      case 'warning':
        return <AlertTriangle size={18} className="icon-orange" />;
      case 'success':
        return <CheckCircle size={18} className="icon-green" />;
      default:
        return <Bell size={18} className="icon-blue" />;
    }
  };

  const getComplaintLink = (complaintId) => {
    if (!complaintId) return null;
    return isAdmin ? `/admin/complaints/${complaintId}` : `/student/complaints/${complaintId}`;
  };

  return (
    <div className="notifications-page">
      <div className="page-header-flex">
        <div className="header-title-wrap">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-count-pill">{unreadCount} Unread</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn btn-secondary btn-sm"
          >
            <CheckCheck size={16} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="notifications-list-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <h3>No notifications yet</h3>
            <p>
              You will receive updates here whenever a complaint is submitted,
              assigned, investigated, or resolved.
            </p>
          </div>
        ) : (
          <div className="notif-items-list">
            {notifications.map((item) => {
              const complaintUrl = getComplaintLink(item.complaint_id);
              return (
                <div
                  key={item.id}
                  className={`notif-item ${!item.is_read ? 'unread' : 'read'}`}
                  onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                >
                  <div className="notif-indicator-dot">
                    {!item.is_read && <span className="blue-dot" />}
                  </div>

                  <div className="notif-icon-box">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="notif-body">
                    <div className="notif-header-row">
                      <h4 className="notif-title">{item.title}</h4>
                      <span className="notif-timestamp">
                        <Clock size={12} />
                        <span>
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                      </span>
                    </div>

                    <p className="notif-message">{item.message}</p>

                    {complaintUrl && (
                      <Link
                        to={complaintUrl}
                        className="notif-action-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>View Complaint</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

