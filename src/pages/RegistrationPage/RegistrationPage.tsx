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
} from '@mui/material';
import { EVENTS } from '../../data/mockData';
import Layout from '../../components/Layout/Layout';
import { telegramWebApp } from '../../api/telegramApi';

const RegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

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

  const event = EVENTS.find((e) => e.id === eventId);

  if (!event) {
    return (
      <Layout title="Ошибка" showBackButton onBackClick={() => navigate('/')}>
        <Typography variant="h6">Мероприятие не найдено</Typography>
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

  const handleSubmit = () => {
    console.log('Регистрация на мероприятие:', {
      eventId: eventId,
      name,
      email,
      phone,
    });

    setActiveStep(3);
  };

  const handleComplete = () => {
    const chatId = `chat${event.id}`;
    navigate(`/chat/${chatId}`);
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
                  bgcolor: event.category.color,
                  width: 50,
                  height: 50,
                  mr: 2,
                }}
              >
                {event.category.shortName}
              </Avatar>
              <Box>
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.date}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" paragraph>
              Вы собираетесь зарегистрироваться на это мероприятие. Для продолжения регистрации
              нажмите "Далее".
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Организатор: {event.organizer.name}
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
              {event.title}
            </Typography>

            <Typography variant="body1" paragraph>
              Дата: {event.date}
            </Typography>

            <Typography variant="body1" paragraph>
              Вам будет доступен чат с организатором мероприятия для получения дополнительной
              информации.
            </Typography>
          </Paper>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          {activeStep < 3 && (
            <Button
              onClick={handleBack}
              fullWidth
              variant="outlined"
              sx={{ height: 48, borderRadius: '14px', fontSize: 17, textTransform: 'none' }}
            >
              {activeStep === 0 ? 'Отмена' : 'Назад'}
            </Button>
          )}
          {activeStep < 2 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === 1 && (!name || !email || !phone)}
              fullWidth
              sx={{ height: 48, borderRadius: '14px', fontSize: 17, textTransform: 'none' }}
            >
              Далее
            </Button>
          )}
          {activeStep === 2 && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!agreed}
              fullWidth
              sx={{ height: 48, borderRadius: '14px', fontSize: 17, textTransform: 'none' }}
            >
              Подтвердить
            </Button>
          )}
          {activeStep === 3 && (
            <Button
              variant="contained"
              onClick={handleComplete}
              fullWidth
              sx={{ height: 48, borderRadius: '14px', fontSize: 17, textTransform: 'none' }}
            >
              Перейти в чат
            </Button>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default RegistrationPage;