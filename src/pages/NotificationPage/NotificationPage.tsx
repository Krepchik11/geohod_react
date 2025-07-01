import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Avatar } from '@mui/material';
import Layout from '../../components/Layout/Layout';
import { EVENTS } from '../../data/mockData';

const NotificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const event = EVENTS.find((e) => e.id === id);

  if (!event) {
    return (
      <Layout title="Ошибка" showBackButton onBackClick={() => navigate('/')}>
        <Typography variant="h6">Мероприятие не найдено</Typography>
      </Layout>
    );
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleConfirm = () => {
    navigate(`/chat/chat${event.id}`);
  };

  return (
    <Layout title="GeoHod" showBackButton onBackClick={handleBack}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" align="center" gutterBottom>
          10 июля
        </Typography>

        <Typography
          variant="subtitle1"
          color="text.secondary"
          align="center"
          gutterBottom
          sx={{ mb: 2 }}
        >
          Непрочитанное сообщение
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Вы создали мероприятие:
          </Typography>

          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                bgcolor: event.category.color,
                width: 40,
                height: 40,
                mr: 2,
              }}
            >
              {event.category.shortName}
            </Avatar>
            <Box>
              <Typography variant="body1">{event.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {event.date}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Инициатор события: {event.organizer.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Ссылка на регистрацию: ЗДЕСЬ
          </Typography>

          <Button variant="contained" fullWidth onClick={handleConfirm}>
            Запустить
          </Button>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src="/path/to/notification-image.jpg"
            alt="Notification"
            style={{
              width: 150,
              height: 'auto',
              marginBottom: 16,
            }}
          />
        </Box>
      </Box>
    </Layout>
  );
};

export default NotificationPage;
