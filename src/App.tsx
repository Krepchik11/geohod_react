import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { useUserStore } from './store/userStore';
import { GlobalStyles } from '@mui/material';
import TelegramThemeProvider from './components/TelegramThemeProvider/TelegramThemeProvider';
import { telegramWebApp } from './api/telegramApi';

import EventsPage from './pages/EventsPage/EventsPage';
import CreateEventPage from './pages/CreateEventPage/CreateEventPage';
import EventDetailsPage from './pages/EventDetailsPage/EventDetailsPage';
import NotificationPage from './pages/NotificationPage/NotificationPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import BottomNavigation from './components/BottomNavigation/BottomNavigation';
import ParticipantsPage from './pages/ParticipantsPage/ParticipantsPage';
import RateOrganizerPage from './pages/RateOrganizerPage';
import FinishEventPage from './pages/FinishEventPage';
import EditEventPage from './pages/EditEventPage';

// Компонент для обработки Telegram параметров
const TelegramRouter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initUser = useUserStore((state) => state.initUser);

  useEffect(() => {
    initUser();
  }, [initUser]);

  // Обработка кнопки назад в Telegram WebApp
  useEffect(() => {
    if (!telegramWebApp?.BackButton) {
      console.log('Telegram BackButton not available');
      return;
    }

    const handleBackButton = () => {
      console.log('Back button clicked, current path:', location.pathname);
      if (location.pathname === '/events') {
        telegramWebApp.close();
      } else {
        navigate(-1);
      }
    };

    // Показываем кнопку на всех страницах кроме /events
    if (location.pathname === '/events') {
      console.log('Hiding back button on /events');
      telegramWebApp.BackButton.hide();
    } else {
      console.log('Showing back button');
      telegramWebApp.BackButton.show();
      telegramWebApp.BackButton.onClick(handleBackButton);
    }

    return () => {
      if (telegramWebApp?.BackButton) {
        telegramWebApp.BackButton.offClick(handleBackButton);
      }
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    // Обработка параметра startapp из Telegram
    const processStartParam = () => {
      if (telegramWebApp?.initDataUnsafe?.start_param) {
        const startParam = telegramWebApp.initDataUnsafe.start_param;
        console.log('Telegram start_param:', startParam);
        
        if (startParam.startsWith('registration_')) {
          const eventId = startParam.replace('registration_', '');
          console.log('Redirecting to event details:', eventId);
          
          // Проверяем, что мы еще не на странице события
          if (!location.pathname.includes(`/event/${eventId}`)) {
            navigate(`/event/${eventId}`, { 
              replace: true,
              state: { fromRegistration: true }
            });
          }
        }
      }
    };

    // Вызываем обработку только один раз при монтировании
    processStartParam();
  }, [navigate, location.pathname]);

  // Добавим отладочный вывод для текущего пути
  useEffect(() => {
    console.log('Current location:', {
      pathname: location.pathname,
      hash: location.hash,
      search: location.search
    });
  }, [location]);

  return (
    <div
      style={{
        paddingBottom: '114px',
        minHeight: '100vh',
        overflow: 'visible',
      }}
    >
      <Routes>
        <Route path="" element={<Navigate to="/events" replace />} />
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/event/:id" element={<EventDetailsPage />} />
        <Route path="/event/:id/participants" element={<ParticipantsPage />} />
        <Route path="/notification/:id" element={<NotificationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/rate-organizer/:id" element={<RateOrganizerPage />} />
        <Route path="/finish-event/:id" element={<FinishEventPage />} />
        <Route path="/edit-event/:id" element={<EditEventPage />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
      <BottomNavigation />
    </div>
  );
};

function App() {
  return (
    <>
      <GlobalStyles
        styles={{
          body: { overflowX: 'hidden' },
          html: { overflowX: 'hidden' },
        }}
      />
      <TelegramThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
          <Router>
            <TelegramRouter />
          </Router>
        </LocalizationProvider>
      </TelegramThemeProvider>
    </>
  );
}

export default App;
