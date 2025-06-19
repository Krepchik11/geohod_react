import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
import Layout from '../../components/Layout/Layout';
import { telegramWebApp } from '../../api/telegramApi';
import { api } from '../../api';
import { useTelegramBackButton } from '../../hooks/useTelegramBackButton';
import ChatIcon from '@mui/icons-material/Chat';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';

interface Event {
  id: string;
  name: string;
  date: string;
  maxParticipants: number;
  currentParticipants: number;
  author: {
    id: string;
    name: string;
    rating?: number;
    avatar?: string;
  };
}

const RegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // Включаем кнопку "Назад" Telegram
  useTelegramBackButton(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const eventData = await api.events.getEventById(id);
        setEvent(eventData);
        // Проверяем, зарегистрирован ли пользователь
        const participantsData = await api.events.getEventParticipants(id);
        const user = telegramWebApp?.initDataUnsafe?.user;
        if (user && participantsData.participants) {
          setIsRegistered(participantsData.participants.some(
            (p: any) => String(p.tgUserId) === String(user.id)
          ));
        }
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Ошибка при загрузке мероприятия');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!event?.id) return;
    try {
      await api.events.registerForEvent(event.id);
      setIsRegistered(true);
    } catch (err: any) {
      console.error('Error registering for event:', err);
      setError(err.message || 'Ошибка при регистрации');
    }
  };

  const handleUnregister = async () => {
    if (!event?.id) return;
    try {
      await api.events.unregisterFromEvent(event.id);
      setIsRegistered(false);
    } catch (err: any) {
      console.error('Error unregistering from event:', err);
      setError(err.message || 'Ошибка при отмене регистрации');
    }
  };

  if (loading || !event) {
    return (
      <Layout title="Регистрация" showBackButton>
        <Box sx={{ p: 2 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Регистрация" showBackButton>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {event.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Человек в группе
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {event.currentParticipants} из {event.maxParticipants}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Организатор
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={event.author.avatar}
            sx={{ width: 48, height: 48, mr: 2 }}
          >
            {event.author.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">{event.author.name}</Typography>
            <Rating
              value={event.author.rating || 0}
              readOnly
              precision={0.1}
              size="small"
            />
          </Box>
        </Box>

        <List sx={{ mb: 3 }}>
          <ListItemButton
            component="a"
            href={`https://t.me/${event.author.name}`}
            target="_blank"
            sx={{
              bgcolor: '#F7F7F7',
              borderRadius: 2,
              mb: 1,
            }}
          >
            <ListItemIcon>
              <Box
                component="img"
                src="/images/chat.svg"
                sx={{ width: 24, height: 24 }}
              />
            </ListItemIcon>
            <ListItemText primary="Чат с организатором" />
          </ListItemButton>

          {isRegistered && (
            <ListItemButton
              onClick={handleUnregister}
              sx={{
                bgcolor: '#FFF5F5',
                borderRadius: 2,
                color: '#FF3B30',
              }}
            >
              <ListItemIcon>
                <Box
                  component="img"
                  src="/images/cancel.svg"
                  sx={{ width: 24, height: 24 }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Отменить регистрацию"
                sx={{ color: '#FF3B30' }}
              />
            </ListItemButton>
          )}
        </List>

        <Button
          variant="contained"
          fullWidth
          onClick={handleRegister}
          disabled={isRegistered || event.currentParticipants >= event.maxParticipants}
          sx={{
            borderRadius: 2,
            py: 2,
            bgcolor: isRegistered ? '#E5E5EA' : '#007AFF',
            '&:hover': {
              bgcolor: isRegistered ? '#E5E5EA' : '#0056b3',
            },
          }}
        >
          {isRegistered ? 'Вы зарегистрированы' : 'Зарегистрироваться'}
        </Button>
      </Box>
    </Layout>
  );
};

export default RegistrationPage;
