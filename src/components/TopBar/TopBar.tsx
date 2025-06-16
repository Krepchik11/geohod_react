import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useTelegramBackButton } from '../../hooks/useTelegramBackButton';
import NotificationContainer from '../NotificationContainer/NotificationContainer';

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  sx?: any;
}

const TopBar: React.FC<TopBarProps> = ({ title, showBackButton = false, sx }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  useTelegramBackButton(showBackButton);

  const handleNotificationsClick = () => {
    setShowNotifications(true);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 2.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 600,
            color: '#000',
            ...sx,
          }}
        >
          {title}
        </Typography>
        <IconButton
          onClick={handleNotificationsClick}
          sx={{
            width: 40,
            height: 40,
            position: 'relative',
            color: '#007AFF',
            '& .MuiSvgIcon-root': {
              fill: '#007AFF',
            },
          }}
        >
          <NotificationsNoneIcon sx={{ fontSize: 24 }} />
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
        </IconButton>
      </Box>

      <NotificationContainer open={showNotifications} onClose={handleCloseNotifications} />
    </>
  );
};

export default TopBar;
