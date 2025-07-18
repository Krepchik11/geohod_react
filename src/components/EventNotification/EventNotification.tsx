import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { api } from '../../api/telegramApi';

interface NotificationProps {
  type:
    | 'registration'
    | 'cancellation'
    | 'reminder'
    | 'review'
    | 'EVENT_CREATED'
    | 'EVENT_CANCELLED'
    | 'PARTICIPANT_REGISTERED'
    | 'PARTICIPANT_UNREGISTERED'
    | 'EVENT_FINISHED';
  eventTitle: string;
  timestamp?: string;
  onViewClick: () => void;
}

const EventNotification: React.FC<NotificationProps> = ({
  type,
  eventTitle,
  timestamp,
  onViewClick,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  let parsedPayload: any = eventTitle;
  try {
    parsedPayload = typeof eventTitle === 'string' ? JSON.parse(eventTitle) : eventTitle;
  } catch {}

  // Дополнительная попытка парсинга, если payload может быть вложенным JSON
  if (typeof parsedPayload === 'string' && parsedPayload.startsWith('{')) {
    try {
      const nestedPayload = JSON.parse(parsedPayload);
      if (nestedPayload && typeof nestedPayload === 'object') {
        parsedPayload = nestedPayload;
      }
    } catch {}
  }

  // Логируем данные уведомления для отладки
  console.log('Notification data:', {
    type,
    eventTitle,
    parsedPayload,
    timestamp,
    payloadKeys: parsedPayload ? Object.keys(parsedPayload) : [],
    payloadValues: parsedPayload ? Object.values(parsedPayload) : [],
  });

  const NotificationContent = {
    EVENT_CANCELLED: {
      icon: (props: any) => (
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.error.main,
            borderRadius: '50%',
          }}
        >
          <SentimentDissatisfiedRoundedIcon sx={{ color: 'white', fontSize: 20 }} {...props} />
        </Box>
      ),
      title: 'Мероприятие отменено',
      getMessage: (payload: any) =>
        `Событие "${payload.eventName || ''}" было отменено. Причина: ${payload.reason || 'не указана'}`,
    },
    PARTICIPANT_REGISTERED: {
      icon: (props: any) => (
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.success.main,
            borderRadius: '50%',
          }}
        >
          <SentimentSatisfiedRoundedIcon sx={{ color: 'white', fontSize: 20 }} {...props} />
        </Box>
      ),
      title: 'Новая регистрация',
      getMessage: (payload: any) =>
        `${payload.participantName || 'Участник'} зарегистрировался на событие "${payload.eventName || ''}"`,
    },
    PARTICIPANT_UNREGISTERED: {
      icon: (props: any) => (
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FBBF0A',
            borderRadius: '50%',
          }}
        >
          <PersonRemoveIcon sx={{ color: 'white', fontSize: 20 }} {...props} />
        </Box>
      ),
      title: 'Отмена регистрации',
      getMessage: (payload: any) =>
        `${payload.participantName || 'Участник'} отменил регистрацию на событие "${payload.eventName || ''}"`,
    },
    EVENT_CREATED: {
      icon: (props: any) => (
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '50%',
          }}
        >
          <EventAvailableIcon sx={{ color: 'white', fontSize: 20 }} {...props} />
        </Box>
      ),
      title: 'Мероприятие создано',
      getMessage: (payload: any) => `Вы создали мероприятие "${payload.eventName || ''}"`,
    },
    EVENT_FINISHED: {
      icon: (props: any) => (
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#A25CE3',
            borderRadius: '50%',
          }}
        >
          <StarBorderIcon sx={{ color: 'white', fontSize: 20 }} {...props} />
        </Box>
      ),
      title: 'Мероприятие завершено',
      getMessage: (payload: any) =>
        payload.reviewText
          ? `Вам оставили отзыв: "${payload.reviewText}" по событию "${payload.eventName || ''}"`
          : `Мероприятие "${payload.eventName || ''}" завершено`,
    },
  };

  const content = NotificationContent[type as keyof typeof NotificationContent] || {
    icon: (props: any) => (
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#BDBDBD',
          borderRadius: '50%',
        }}
      >
        <StarBorderIcon sx={{ color: 'white', fontSize: 20 }} {...props} />
      </Box>
    ),
    title: 'Уведомление',
    getMessage: (payload: any) =>
      typeof payload === 'string' ? payload : 'У вас новое уведомление',
  };

  const navigate = useNavigate();

  const handleViewEvent = async () => {
    // Если есть eventId, переходим сразу
    if (parsedPayload && parsedPayload.eventId) {
      console.log('Найден eventId в payload:', parsedPayload.eventId);
      navigate(`/event/${parsedPayload.eventId}`);
      return;
    }

    // Проверяем все возможные поля для eventId
    if (parsedPayload) {
      const possibleEventIdFields = ['eventId', 'event_id', 'id'];
      for (const field of possibleEventIdFields) {
        if (parsedPayload[field]) {
          console.log(`Найден eventId в поле ${field}:`, parsedPayload[field]);
          navigate(`/event/${parsedPayload[field]}`);
          return;
        }
      }
    }

    // Проверяем, может ли сам payload быть eventId
    if (typeof parsedPayload === 'string' && /^\d+$/.test(parsedPayload)) {
      console.log('Payload является eventId:', parsedPayload);
      navigate(`/event/${parsedPayload}`);
      return;
    }

    // Проверяем, может ли eventTitle быть eventId
    if (typeof eventTitle === 'string' && /^\d+$/.test(eventTitle)) {
      console.log('eventTitle является eventId:', eventTitle);
      navigate(`/event/${eventTitle}`);
      return;
    }

    // Для EVENT_CREATED - просто получаем все события и берем самое последнее
    if (type === 'EVENT_CREATED' && parsedPayload && parsedPayload.authorId) {
      setIsLoading(true);
      try {
        const eventsResponse = await api.events.getEventsByAuthor(parsedPayload.authorId, {
          page: 0,
          size: 1,
          sort: 'createdAt,desc',
        });

        if (eventsResponse.content && eventsResponse.content.length > 0) {
          const latestEvent = eventsResponse.content[0];
          console.log('Найдено последнее событие автора:', latestEvent.id);
          navigate(`/event/${latestEvent.id}`);
        } else {
          console.log('События автора не найдены');
          onViewClick();
        }
      } catch (error) {
        console.error('Ошибка при поиске события:', error);
        onViewClick();
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Если eventId не найден, но есть eventName, пытаемся найти событие по названию
    if (parsedPayload && parsedPayload.eventName && type !== 'EVENT_CREATED') {
      setIsLoading(true);
      try {
        const eventsResponse = await api.events.getAllEvents({
          page: 0,
          size: 50,
        });

        if (eventsResponse.content && eventsResponse.content.length > 0) {
          const matchingEvent = eventsResponse.content.find(
            (event: any) =>
              event.name && event.name.toLowerCase().includes(parsedPayload.eventName.toLowerCase())
          );

          if (matchingEvent) {
            console.log('Найдено событие по названию:', matchingEvent.id);
            navigate(`/event/${matchingEvent.id}`);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Ошибка при поиске события по названию:', error);
      } finally {
        setIsLoading(false);
      }
    }

    console.log('Событие не найдено, закрываем попап');
    onViewClick();
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '14px',
        mb: 2,
        overflow: 'hidden',
        background: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: '14px 14px 0 0',
          boxShadow: '0px 1px 5px 1px #00000026 15%',
        }}
      >
        <Box>{content.icon({})}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {content.title}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color: 'text.secondary',
            }}
          >
            {content.getMessage(parsedPayload)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: '0 0 14px 14px',
          boxShadow: '0px 0.5px 0px rgba(0, 0, 0, 0.15)',
          mb: 0,
        }}
      >
        <Box
          onClick={isLoading ? undefined : handleViewEvent}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: isLoading ? theme.palette.text.disabled : theme.palette.primary.main,
            cursor: isLoading ? 'default' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
          <Typography
            sx={{
              fontSize: '14px',
              lineHeight: '18px',
              fontWeight: 500,
              fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
            }}
          >
            {isLoading ? 'Поиск события...' : 'Посмотреть событие'}
          </Typography>
        </Box>
        {timestamp && (
          <Typography
            sx={{
              fontSize: '14px',
              lineHeight: '16px',
              color: '#8E8E93',
              fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
            }}
          >
            {formatDate(timestamp)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default EventNotification;
