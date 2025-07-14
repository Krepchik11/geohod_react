import React from 'react';
import { Box, Typography } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';

interface NotificationProps {
  type: 'registration' | 'cancellation' | 'reminder' | 'review';
  eventTitle: string;
  timestamp?: string;
  onViewClick: () => void;
}

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
          backgroundColor: '#FF3B30',
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
          backgroundColor: '#2EBC65',
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
          backgroundColor: '#007AFF',
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

const EventNotification: React.FC<NotificationProps> = ({
  type,
  eventTitle,
  timestamp,
  onViewClick,
}) => {
  let parsedPayload: any = eventTitle;
  try {
    parsedPayload = typeof eventTitle === 'string' ? JSON.parse(eventTitle) : eventTitle;
  } catch {}

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

  const handleViewEvent = () => {
    if (parsedPayload && parsedPayload.eventId) {
      navigate(`/event/${parsedPayload.eventId}`);
    } else {
      onViewClick();
    }
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
          onClick={handleViewEvent}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#007AFF',
            cursor: 'pointer',
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
            Посмотреть событие
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
