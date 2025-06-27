import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationContainer from '../NotificationContainer/NotificationContainer';

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  sx?: any;
}

const TopBar: React.FC<TopBarProps> = ({ title, showBackButton = false, showNotifications = true, sx }) => {
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);

  const handleNotificationsClick = () => {
    setShowNotificationsPopup(true);
  };

  const handleCloseNotifications = () => {
    setShowNotificationsPopup(false);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: '20px',
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
            margin: '2px 0',
            flex: 1,
            paddingRight: showNotifications ? '16px' : '0',
            ...sx,
          }}
        >
          {title}
        </Typography>
        {showNotifications && (
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
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
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
        )}
      </Box>

      <NotificationContainer open={showNotificationsPopup} onClose={handleCloseNotifications} />
    </>
  );
};

export default TopBar;
