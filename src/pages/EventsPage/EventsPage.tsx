import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import TopBar from '../../components/TopBar/TopBar';
import EventCard from '../../components/EventCard/EventCard';
import { useLocation, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast/Toast';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { useEventsStore } from '../../store/eventsStore';

interface Author {
  id: string;
  username: string;
  name: string;
  imageUrl: string;
}

interface Event {
  id: string;
  author: Author;
  name: string;
  description: string;
  date: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
}

const EventsPage: React.FC = () => {
  const { events, loading, error, fetchEvents } = useEventsStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUnregisterToast, setShowUnregisterToast] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (location.state?.showUnregisterToast) {
      setShowUnregisterToast(true);
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => setShowUnregisterToast(false), 2000);
    }
  }, [location, navigate]);

  // Новый useEffect для обновления при возврате на /events
  useEffect(() => {
    if (location.pathname === '/events') {
      fetchEvents();
    }
  }, [location.pathname, fetchEvents]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Дата не указана';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      console.error('Ошибка при форматировании даты:', e);
      return 'Некорректная дата';
    }
  };

  if (loading) {
    return (
      <Box>
        <TopBar showBackButton={false} title="События" />
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <TopBar title="События" showBackButton={false} />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return (
    <Box>
      <TopBar showBackButton={false} title="События" />
      <Box sx={{ maxWidth: '100vw', overflowX: 'hidden' }}>
        {sortedEvents.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            title={event.name}
            date={event.date}
            registeredCount={event.currentParticipants}
            maxParticipants={event.maxParticipants}
            organizerAvatar={event.author.imageUrl}
            organizerId={event.author.id}
            isPast={new Date(event.date) < today}
            status={event.status}
          />
        ))}
        {events.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>Нет доступных событий</Typography>
          </Box>
        )}
      </Box>
      {showUnregisterToast && (
        <Toast
          message="Вы отменили регистрацию на событие"
          isVisible={true}
          type="error"
          icon={
            <Box
              sx={{
                bgcolor: '#FF3B30',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SentimentVeryDissatisfiedIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
          }
        />
      )}
    </Box>
  );
};

export default EventsPage;
