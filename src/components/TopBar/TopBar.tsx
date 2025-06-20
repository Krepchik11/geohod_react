import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationContainer from '../NotificationContainer/NotificationContainer';

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  sx?: any;
}

const TopBar: React.FC<TopBarProps> = ({ title, showBackButton = false, sx }) => {
  const [showNotifications, setShowNotifications] = useState(false);

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
            fontSize: {
              xs: '18px',
              sm: '20px',
              md: '24px'
            },
            fontWeight: 600,
            color: '#000',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            maxHeight: '2.4em',
            margin: '4px 0',
            flex: 1,
            paddingRight: '16px',
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
            flexShrink: 0,
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
