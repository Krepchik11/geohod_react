import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import Layout from '../../components/Layout/Layout';
import { telegramWebApp } from '../../api/telegramApi';
import { api } from '../../api';
import { useUserStore } from '../../store/userStore';

const RegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eventId, setEventId] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [registered, setRegistered] = useState(false);
  const user = useUserStore((state) => state.user);

  // Обработка параметра startapp из Telegram
  useEffect(() => {
    if (telegramWebApp?.initDataUnsafe?.start_param) {
      // Если есть start_param, извлекаем ID события
      const startParam = telegramWebApp.initDataUnsafe.start_param;
      if (startParam.startsWith('registration_')) {
        const extractedId = startParam.replace('registration_', '');
        setEventId(extractedId);
      }
    } else if (id) {
      // Если нет start_param, используем ID из URL
      setEventId(id);
    }
  }, [id]);

  // Загрузка события с сервера
  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await api.events.getEventById(eventId);
        setEvent(eventData);
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Ошибка при загрузке мероприятия');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <Layout title="Загрузка" showBackButton onBackClick={() => navigate('/')}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout title="Ошибка" showBackButton onBackClick={() => navigate('/')}>
        <Typography variant="h6">{error || 'Мероприятие не найдено'}</Typography>
      </Layout>
    );
  }

  const handleBack = () => {
    navigate(`/event/${eventId}`);
  };

  const handleSubmit = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Регистрация на мероприятие
      await api.events.registerForEvent(eventId);
      
      // Успешная регистрация
      setRegistered(true);
    } catch (err: any) {
      console.error('Error registering for event:', err);
      setError(err.message || 'Ошибка при регистрации на мероприятие');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate(`/event/${eventId}`);
  };

  return (
    <Layout title="Регистрация" showBackButton onBackClick={handleBack} showMenu={false}>
      <Box sx={{ p: 2 }}>
        {registered ? (
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Вы успешно зарегистрировались на мероприятие!
            </Alert>

            <Typography variant="h6" gutterBottom>
              {event.name}
            </Typography>

            <Typography variant="body1" paragraph>
              Дата: {event.date}
            </Typography>

            <Typography variant="body1" paragraph>
              Вы можете вернуться к описанию мероприятия, чтобы увидеть подробную информацию.
            </Typography>

            <Button
              variant="contained"
              onClick={handleComplete}
              fullWidth
              sx={{ height: 48, borderRadius: '14px', fontSize: 17, textTransform: 'none' }}
            >
              Вернуться к мероприятию
            </Button>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  bgcolor: event.category?.color || '#007AFF',
                  width: 50,
                  height: 50,
                  mr: 2,
                }}
              >
                {event.category?.shortName || event.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{event.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.date}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" paragraph>
              Вы собираетесь зарегистрироваться на это мероприятие как {user?.first_name} {user?.last_name}.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Организатор: {event.author?.name || event.organizer?.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Участников: {event.currentParticipants}/{event.maxParticipants}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Нажимая "Подтвердить", вы соглашаетесь с условиями участия в мероприятии.
            </Typography>

            <Button
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => setAgreed(!agreed)}
              color={agreed ? 'primary' : 'inherit'}
            >
              {agreed ? '✓ Согласен с условиями' : 'Согласен с условиями'}
            </Button>

            <Box sx={{ mt: 3 }}>
              <Button
                onClick={handleBack}
                fullWidth
                variant="outlined"
                sx={{ height: 48, borderRadius: '14px', fontSize: 17, textTransform: 'none', mb: 2 }}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!agreed || loading}
                fullWidth
                sx={{ height: 48, borderRadius: '14px', fontSize: 17, textTransform: 'none' }}
              >
                {loading ? 'Регистрация...' : 'Подтвердить'}
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Layout>
  );
};

export default RegistrationPage;