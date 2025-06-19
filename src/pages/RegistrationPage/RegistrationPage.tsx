import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  Paper,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import Layout from '../../components/Layout/Layout';
import { telegramWebApp } from '../../api/telegramApi';
import { api } from '../../api';

interface Event {
  id: string;
  name: string;
  date: string;
  maxParticipants: number;
  currentParticipants: number;
  author: {
    id: string;
    name: string;
  };
}

const RegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Загрузка события с бэкенда
  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching event with ID:', eventId);
        const eventData = await api.events.getEventById(eventId);
        console.log('Event data received:', eventData);
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

  if (!eventId) {
    return (
      <Layout title="Ошибка" showBackButton onBackClick={() => navigate('/events')}>
        <Typography variant="h6">ID мероприятия не найден</Typography>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="Загрузка" showBackButton onBackClick={() => navigate('/events')}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout title="Ошибка" showBackButton onBackClick={() => navigate('/events')}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Мероприятие не найдено'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/events')}>
          Вернуться к списку мероприятий
        </Button>
      </Layout>
    );
  }

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(`/event/${eventId}`);
    } else {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleSubmit = async () => {
    try {
      console.log('Регистрация на мероприятие:', {
        eventId: eventId,
        name,
        email,
        phone,
      });

      // Здесь должен быть вызов API для регистрации
      // await api.events.registerForEvent(eventId, { name, email, phone });
      
      setActiveStep(3);
    } catch (err: any) {
      console.error('Error registering for event:', err);
      setError(err.message || 'Ошибка при регистрации');
    }
  };

  const handleComplete = () => {
    navigate(`/event/${eventId}`);
  };

  const steps = ['Информация', 'Данные', 'Подтверждение', 'Готово'];

  return (
    <Layout title="Регистрация" showBackButton onBackClick={handleBack} showMenu={false}>
      <Box sx={{ p: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  bgcolor: '#007AFF',
                  width: 50,
                  height: 50,
                  mr: 2,
                }}
              >
                {event.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{event.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(event.date).toLocaleDateString('ru-RU')}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" paragraph>
              Вы собираетесь зарегистрироваться на это мероприятие. Для продолжения регистрации
              нажмите "Далее".
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Организатор: {event.author.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Участников: {event.currentParticipants}/{event.maxParticipants}
            </Typography>
          </Paper>
        )}

        {activeStep === 1 && (
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Введите ваши данные
            </Typography>

            <TextField
              fullWidth
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="normal"
              required
            />
          </Paper>
        )}

        {activeStep === 2 && (
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Подтвердите данные
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Имя:</Typography>
              <Typography variant="body1">{name}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Email:</Typography>
              <Typography variant="body1">{email}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Телефон:</Typography>
              <Typography variant="body1">{phone}</Typography>
            </Box>

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
          </Paper>
        )}

        {activeStep === 3 && (
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Вы успешно зарегистрировались на мероприятие!
            </Alert>

            <Typography variant="h6" gutterBottom>
              {event.name}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Мы отправили подтверждение на ваш email. Не забудьте добавить мероприятие в календарь!
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={handleComplete}
              sx={{ mt: 2 }}
            >
              Перейти к мероприятию
            </Button>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Назад
          </Button>
          
          {activeStep < 3 ? (
            <Button
              variant="contained"
              onClick={activeStep === 2 ? handleSubmit : handleNext}
              disabled={activeStep === 2 && !agreed}
            >
              {activeStep === 2 ? 'Подтвердить' : 'Далее'}
            </Button>
          ) : null}
        </Box>
      </Box>
    </Layout>
  );
};

export default RegistrationPage;
