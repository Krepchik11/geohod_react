import React from 'react';
import { Box, Typography } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface NotificationProps {
  type: 'registration' | 'cancellation' | 'reminder' | 'review';
  eventTitle: string;
  timestamp?: string;
  onViewClick: () => void;
}

const NotificationContent = {
  registration: {
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
    title: 'Регистрация подтверждена',
    getMessage: (title: string) => `Вы успешно зарегистрировались на событие "${title}"`,
  },
  cancellation: {
    icon: (props: any) => (
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FF0000',
          borderRadius: '50%',
        }}
      >
        <SentimentDissatisfiedRoundedIcon sx={{ color: 'white', fontSize: 20 }} {...props} />
      </Box>
    ),
    title: 'Отменена события',
    getMessage: (title: string) => `Событие "${title}" было отменено организатором`,
  },
  reminder: {
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
        <ScheduleRoundedIcon sx={{ color: 'white', fontSize: 20 }} {...props} />
      </Box>
    ),
    title: 'Напоминание о событии',
    getMessage: (title: string) => `Напоминаем, что завтра состоится событие "${title}"`,
  },
  review: {
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
    title: 'Отзыв об инициаторе события',
    getMessage: (title: string) =>
      `Ваше событие "${title}" завершено, пожалуйста оставьте свой отзыв`,
  },
};

const EventNotification: React.FC<NotificationProps> = ({
  type,
  eventTitle,
  timestamp,
  onViewClick,
}) => {
  const content = NotificationContent[type];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: '#FFFFFF',
          borderRadius: '14px 14px 0 0',
          boxShadow: '0px 1px 5px 1px #00000026',
        }}
      >
        <Box>{content.icon({})}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 500,
              color: '#000',
            }}
          >
            {content.title}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color: '#8E8E93',
            }}
          >
            {content.getMessage(eventTitle)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: '#FFFFFF',
          borderRadius: '0 0 14px 14px',
          boxShadow: '0px 0.5px 0px rgba(0, 0, 0, 0.15)',
          mb: 1,
        }}
      >
        <Box
          onClick={onViewClick}
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
            {timestamp}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default EventNotification;
