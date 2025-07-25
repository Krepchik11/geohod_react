import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/telegramApi';

export const useUnreadNotifications = () => {
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkUnreadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.notifications.getNotifications({ limit: 1, isRead: false });
      setHasUnread(response.data && response.data.length > 0);
    } catch (error) {
      console.error('Error checking unread notifications:', error);
      setHasUnread(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        await api.notifications.dismissNotification(notificationId);
        // Перепроверяем непрочитанные уведомления
        await checkUnreadNotifications();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [checkUnreadNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await api.notifications.dismissAllNotifications();
      setHasUnread(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  useEffect(() => {
    checkUnreadNotifications();
  }, [checkUnreadNotifications]);

  return {
    hasUnread,
    loading,
    checkUnreadNotifications,
    markAsRead,
    markAllAsRead,
  };
};
