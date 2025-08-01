import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationContainer from '../NotificationContainer/NotificationContainer';
import { api } from '../../api/telegramApi';
// import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  sx?: any;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  showBackButton = false,
  showNotifications = true,
  sx,
}) => {
  const theme = useTheme();
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const checkUnreadNotifications = async () => {
    try {
      const response = await api.notifications.getNotifications({ limit: 1, isRead: false });
      setHasUnread(response.data && response.data.length > 0);
    } catch (error) {
      console.error('Error checking unread notifications:', error);
      setHasUnread(false);
    }
  };

  const handleNotificationsClick = async () => {
    setShowNotificationsPopup(true);
    // Отмечаем все уведомления как прочитанные при открытии
    try {
      await api.notifications.dismissAllNotifications();
      setHasUnread(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleCloseNotifications = () => {
    setShowNotificationsPopup(false);
  };

  useEffect(() => {
    checkUnreadNotifications();
  }, []);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          position: 'relative',
        }}
      >
        {showBackButton && (
          <IconButton onClick={() => window.history.back()} sx={{ position: 'absolute', left: 8 }}>
            {/* иконка назад */}
          </IconButton>
        )}
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            color: theme.palette.text.primary,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            maxHeight: '2.4em',
            margin: 0,
            flex: 1,
            textAlign: 'center',
            paddingRight: 0,
            paddingLeft: 0,
            ...sx,
          }}
        >
          {title}
        </Typography>
        {showNotifications && (
          <IconButton
            onClick={handleNotificationsClick}
            sx={{
              position: 'absolute',
              right: 8,
              width: 40,
              height: 40,
              color: theme.palette.primary.main,
              flexShrink: 0,
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
            {hasUnread && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  bgcolor: '#FF3B30',
                  borderRadius: '50%',
                }}
              />
            )}
          </IconButton>
        )}
      </Box>

      <NotificationContainer
        open={showNotificationsPopup}
        onClose={handleCloseNotifications}
        onNotificationsRead={checkUnreadNotifications}
      />
    </>
  );
};

export default TopBar;
