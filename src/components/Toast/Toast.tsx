import React, { ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'error' | 'success' | 'warning';
  onClose?: () => void;
  icon?: ReactNode;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, type = 'error', icon }) => {
  const theme = useTheme();
  
  if (!isVisible) return null;

  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />;
      case 'error':
        return <SentimentVeryDissatisfiedIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />;
      default:
        return <ErrorOutlineIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />;
    }
  };

  return (
    <>
              <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            width: '97%',
            margin: '0 auto',
            borderRadius: '16px',
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            animation: 'slideDown 0.3s ease-out',
            '@keyframes slideDown': {
              from: {
                transform: 'translateY(-100%)',
              },
              to: {
                transform: 'translateY(0)',
              },
            },
          }}
        >
        {getIcon()}
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
          }}
        >
          {message}
        </Typography>
      </Box>
    </>
  );
};

export default Toast;
