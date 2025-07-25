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

  useEffect(() => {
    checkUnreadNotifications();
  }, [checkUnreadNotifications]);

  return {
    hasUnread,
    loading,
    checkUnreadNotifications,
  };
};
