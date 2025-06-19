import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
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
  const initUser = useUserStore((state) => state.initUser);

  useEffect(() => {
    initUser();
  }, [initUser]);

  useEffect(() => {
    // Обработка параметра startapp из Telegram
    if (telegramWebApp?.initDataUnsafe?.start_param) {
      const startParam = telegramWebApp.initDataUnsafe.start_param;
      console.log('Telegram start_param:', startParam);
      
      if (startParam.startsWith('registration_')) {
        const eventId = startParam.replace('registration_', '');
        console.log('Redirecting to event details:', eventId);
        navigate(`/event/${eventId}`);
      }
    }
  }, [navigate]);

  return (
    <div
      style={{
        paddingBottom: '114px',
        minHeight: '100vh',
        overflow: 'visible',
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/event/:id" element={<EventDetailsPage />} />
        <Route path="/event/:id/participants" element={<ParticipantsPage />} />
        <Route path="/register/:id" element={<RegistrationPage />} />
        <Route path="/notification/:id" element={<NotificationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/rate-organizer/:id" element={<RateOrganizerPage />} />
        <Route path="/finish-event/:id" element={<FinishEventPage />} />
        <Route path="/edit-event/:id" element={<EditEventPage />} />
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
