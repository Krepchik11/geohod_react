import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  useTheme,
} from '@mui/material';
import { telegramWebApp } from '../../api/telegramApi';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  React.useEffect(() => {
    if (telegramWebApp?.MainButton) {
      telegramWebApp.MainButton.hide();
    }
  }, [location.pathname]);

  const getIcon = (iconName: string, isSelected: boolean) => (
    <Box
      component="img"
      src={`/images/bottomBar/${iconName}.svg`}
      alt={iconName}
      sx={{
        width: 21,
        height: 21,
        filter: isSelected
          ? 'brightness(0) invert(1)'
          : 'invert(37%) sepia(95%) saturate(4383%) hue-rotate(199deg) brightness(100%) contrast(99%)',
      }}
    />
  );

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 34,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        borderRadius: '40px',
        overflow: 'hidden',
        width: 300,
        bgcolor: theme.palette.background.default,
      }}
      elevation={3}
    >
      <MuiBottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => {
          navigate(newValue);
        }}
        sx={{
          height: 66,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            width: 100,
            maxWidth: 120,
            minHeight: 66,
            padding: 0,
            color: theme.palette.text.secondary,
            '& .MuiBottomNavigationAction-label': {
              fontSize: 15,
              lineHeight: '14px',
              letterSpacing: '0.4px',
              fontWeight: 500,
              opacity: 1,
              transition: 'none',
              marginTop: '8px',
              '&.Mui-selected': {
                fontSize: 17,
              },
            },
            '& .MuiBottomNavigationAction-wrapper': {
              gap: '8px',
            },
            '&.Mui-selected': {
              color: '#FFFFFF',
            },
          },
          '& .MuiBottomNavigationAction-root.Mui-selected': {
            bgcolor: '#007AFF',
            borderRadius: 0,
            color: '#FFFFFF',
          },
        }}
      >
        <BottomNavigationAction
          label="События"
          value="/events"
          icon={getIcon('events', location.pathname === '/events')}
        />
        <BottomNavigationAction
          label="Создать"
          value="/create-event"
          icon={getIcon('create', location.pathname === '/create-event')}
        />
        <BottomNavigationAction
          label="Профиль"
          value="/profile"
          icon={getIcon('person', location.pathname === '/profile')}
        />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation;
