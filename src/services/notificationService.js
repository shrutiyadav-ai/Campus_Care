import { neonSql, neonRealtimeConfig } from './neon';
import { authService } from './authService';

export const notificationService = {
  // Get notifications for the current user
  async getNotifications() {
    if (!neonSql) return [];

    const user = await authService.getUser();
    if (!user) return [];

    const rows = await neonSql`
      SELECT * FROM notifications
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC;
    `;

    return rows || [];
  },

  // Get unread count
  async getUnreadCount() {
    if (!neonSql) return 0;

    const user = await authService.getUser();
    if (!user) return 0;

    const rows = await neonSql`
      SELECT count(*) FROM notifications
      WHERE user_id = ${user.id} AND is_read = false;
    `;

    return Number(rows[0]?.count) || 0;
  },

  // Mark notification as read
  async markAsRead(id) {
    if (!neonSql) return null;

    const rows = await neonSql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${id}
      RETURNING *;
    `;

    return rows[0] || null;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    if (!neonSql) return;

    const user = await authService.getUser();
    if (!user) return;

    await neonSql`
      UPDATE notifications
      SET is_read = true
      WHERE user_id = ${user.id} AND is_read = false;
    `;
  },

  // Create a notification
  async createNotification({ userId, title, message, type, complaintId }) {
    if (!neonSql) return null;

    const rows = await neonSql`
      INSERT INTO notifications (user_id, title, message, type, complaint_id)
      VALUES (
        ${userId},
        ${title},
        ${message || ''},
        ${type || 'info'},
        ${complaintId || null}
      )
      RETURNING *;
    `;

    return rows[0] || null;
  },

  // Subscribe to notifications (Neon Realtime / Polling fallback)
  subscribeToNotifications(userId, callback) {
    let ws = null;
    const rtUrl = neonRealtimeConfig.url;

    if (rtUrl && typeof WebSocket !== 'undefined') {
      try {
        ws = new WebSocket(rtUrl);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.user_id === userId) {
              callback(data);
            }
          } catch (e) {}
        };
      } catch (e) {
        console.warn('Neon Realtime connection fallback:', e);
      }
    }

    // Polling interval every 15 seconds to ensure notifications are always refreshed
    const interval = setInterval(async () => {
      try {
        if (!neonSql) return;
        const unread = await notificationService.getUnreadCount();
        if (unread > 0) {
          const latest = await neonSql`
            SELECT * FROM notifications 
            WHERE user_id = ${userId} 
            ORDER BY created_at DESC 
            LIMIT 1;
          `;
          if (latest[0]) callback(latest[0]);
        }
      } catch (e) {}
    }, 15000);

    return () => {
      clearInterval(interval);
      if (ws) {
        try { ws.close(); } catch (e) {}
      }
    };
  },
};
