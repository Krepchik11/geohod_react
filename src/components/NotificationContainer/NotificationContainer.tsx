import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Slide, useTheme } from '@mui/material';
import EventNotification from '../EventNotification/EventNotification';
import api from '../../api/telegramApi';
import { Notification } from '../../types/notification';
import { useEventsStore } from '../../store/eventsStore';
// import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';

interface NotificationContainerProps {
  open: boolean;
  onClose: () => void;
  onNotificationsRead?: () => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  open,
  onClose,
  onNotificationsRead,
}) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursorId, setCursorId] = useState<number | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const PAGE_SIZE = 20;
  const { events, fetchEvents } = useEventsStore();
  // const { markAsRead } = useUnreadNotifications();

  const loadNotifications = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params: any = { limit: PAGE_SIZE };
      if (cursorId) params.cursorIdAfter = cursorId;
      const res = await api.notifications.getNotifications(params);
      const newNotifications = res.data || [];
      console.log('Загружены уведомления:', newNotifications);
      setNotifications((prev) => [...prev, ...newNotifications]);
      setHasMore(newNotifications.length === PAGE_SIZE);
      if (newNotifications.length > 0) {
        setCursorId(newNotifications[newNotifications.length - 1].id);
      }
    } catch (e) {
      console.error('Ошибка загрузки уведомлений:', e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, cursorId]);

  useEffect(() => {
    if (open) {
      setNotifications([]);
      setCursorId(null);
      setHasMore(true);
      // Загружаем события, если они еще не загружены
      if (!events || events.length === 0) {
        fetchEvents();
      }
    }
  }, [open, events, fetchEvents]);

  useEffect(() => {
    console.log('useEffect для загрузки уведомлений:', {
      open,
      notificationsLength: notifications.length,
      hasMore,
      loading,
    });
    if (open && notifications.length === 0 && hasMore && !loading) {
      loadNotifications();
    }
  }, [open, notifications.length, hasMore, loading, loadNotifications]);

  useEffect(() => {
    if (!open) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadNotifications();
        }
      },
      { rootMargin: '100px' }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [open, hasMore, loading, loadNotifications]);

  // Временно отключаем автоматическое пометку как прочитанные
  // useEffect(() => {
  //   if (open && notifications.length > 0) {
  //     markAllVisibleAsRead(notifications);
  //   }
  // }, [open, notifications]);

  return (
    <>
      {open && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1100,
              backgroundColor: 'rgba(14, 24, 30, 0.4)',
            }}
            onClick={onClose}
          />
          <Box
            sx={{
              position: 'fixed',
              top: 30,
              right: 30,
              zIndex: 1300,
            }}
          >
            <Box
              component="img"
              src="/images/close-popup.svg"
              alt="Close"
              onClick={onClose}
              sx={{
                width: 50,
                height: 50,
                cursor: 'pointer',
              }}
            />
          </Box>
        </>
      )}

      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            borderTopLeftRadius: '14px',
            borderTopRightRadius: '14px',
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 1200,
            pb: 'calc(56px + env(safe-area-inset-bottom))',
            boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box sx={{ px: 2, pt: 2, pb: 2 }}>
            {notifications.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', color: theme.palette.text.secondary, py: 4 }}>
                Нет уведомлений
              </Box>
            )}
            {notifications.map((notification, index) => (
              <EventNotification
                key={notification.id || index}
                type={notification.type || 'review'}
                eventTitle={notification.payload || ''}
                timestamp={notification.createdAt || ''}
                onViewClick={() => {
                  onClose();
                  if (onNotificationsRead) {
                    onNotificationsRead();
                  }
                }}
                notificationId={notification.id}
                eventId={notification.eventId}
              />
            ))}
            {loading && (
              <Box sx={{ textAlign: 'center', color: theme.palette.text.secondary, py: 2 }}>
                Загрузка...
              </Box>
            )}
            {hasMore && <div ref={loaderRef} style={{ height: 20 }} />}
          </Box>
        </Box>
      </Slide>
    </>
  );
};

export default NotificationContainer;
