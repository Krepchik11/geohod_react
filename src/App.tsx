import React, { useEffect, useState } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useScrollToTop } from './hooks/useScrollToTop';
// import { useUnreadNotifications } from './hooks/useUnreadNotifications';
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
import ReviewPage from './pages/ReviewPage/ReviewPage';

const TelegramRouter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initUser = useUserStore((state) => state.initUser);
  const [lastRedirect, setLastRedirect] = useState<string | null>(null);

  // Автоматический скролл наверх при смене маршрута
  useScrollToTop();

  // Проверяем непрочитанные уведомления при смене маршрута
  // const { checkUnreadNotifications } = useUnreadNotifications();

  // useEffect(() => {
  //   checkUnreadNotifications();
  // }, [location.pathname, checkUnreadNotifications]);

  const hideBottomNavPaths = ['/create-event', '/edit-event', '/finish-event', '/review'];

  const shouldHideBottomNav =
    hideBottomNavPaths.some((path) => location.pathname.startsWith(path)) ||
    (location.pathname.startsWith('/event/') && location.pathname !== '/events');

  const safeRoutes = ['/profile', '/create-event', '/events'];

  useEffect(() => {
    initUser();
  }, [initUser]);

  useEffect(() => {
    if (!telegramWebApp?.BackButton) {
      return;
    }

    const handleBackButton = () => {
      if (location.pathname === '/events') {
        telegramWebApp.close();
      } else {
        navigate(-1);
      }
    };
    if (location.pathname === '/events') {
      telegramWebApp.BackButton.hide();
    } else {
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
    const initTelegram = async () => {
      try {
        const webApp = window.Telegram.WebApp;
        webApp.ready();

        const urlParams = new URLSearchParams(window.location.search);
        const startParam =
          urlParams.get('startapp') ||
          urlParams.get('start_param') ||
          webApp.initDataUnsafe?.start_param;

        if (startParam?.startsWith('registration_')) {
          const eventId = startParam.replace('registration_', '');
          const targetPath = `/event/${eventId}`;

          const shouldRedirect =
            location.pathname !== targetPath &&
            !safeRoutes.includes(location.pathname) &&
            lastRedirect !== targetPath;

          if (shouldRedirect) {
            setLastRedirect(targetPath);
            navigate(targetPath);
          }
        } else if (startParam?.startsWith('review_')) {
          // Обработка ссылки на отзыв
          const targetPath = `/review?startapp=${startParam}`;

          const shouldRedirect =
            location.pathname !== '/review' &&
            !safeRoutes.includes(location.pathname) &&
            lastRedirect !== targetPath;

          if (shouldRedirect) {
            setLastRedirect(targetPath);
            navigate(targetPath);
          }
        } else if (location.pathname === '/') {
          if (!lastRedirect) {
            navigate('/events');
          }
        }

        const shouldShowBackButton = location.pathname !== '/events';
        webApp.BackButton.isVisible = shouldShowBackButton;
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error);
      }
    };

    initTelegram();
  }, [location.pathname, navigate, lastRedirect]);

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
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/rate-organizer/:id" element={<RateOrganizerPage />} />
        <Route path="/finish-event/:id" element={<FinishEventPage />} />
        <Route path="/edit-event/:id" element={<EditEventPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
      {!shouldHideBottomNav && <BottomNavigation />}
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
