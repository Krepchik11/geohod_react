import React from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { EventStatus } from '../../api';
import { useUserStore } from '../../store/userStore';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  registeredCount: number;
  maxParticipants: number;
  organizerAvatar?: string;
  isPast?: boolean;
  status?: EventStatus | string;
  registrationCanceled?: boolean;
}

const ParticipantsCount = styled('div')({
  display: 'inline',
  '& .blue-digit': {
    color: '#007AFF',
  },
  '& .black-digits': {
    color: '#000000',
  },
});

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  registeredCount,
  maxParticipants,
  organizerAvatar,
  isPast = false,
  status,
  registrationCanceled,
}) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const handleCardClick = () => {
    navigate(`/event/${id}`);
  };

  const handleFinishClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/finish-event/${id}`);
  };

  const isToday = (() => {
    const eventDate = new Date(date);
    const today = new Date();
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return eventDate.getTime() === today.getTime();
  })();

  const isOrganizer = user && user.id && status !== EventStatus.CANCELED && status !== EventStatus.FINISHED && isToday;

  const formatDateTime = (dateStr: string) => {
    if (dateStr.includes('.')) {
      const [day, month, year] = dateStr.split('.');
      return `${day}.${month}.${year}`;
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Box
      onClick={handleCardClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        opacity: isPast ? 0.5 : 1,
        filter: isPast ? 'grayscale(1)' : 'none',
      }}
    >
      <Avatar
        src={organizerAvatar}
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
        }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: '17px',
            fontWeight: 500,
            lineHeight: '22px',
            mb: 0.5,
            fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 180,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: '15px',
            color: 'text.secondary',
            fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
          }}
        >
          {formatDateTime(date)}
        </Typography>
        {status === EventStatus.CANCELED && (
          <Typography sx={{ color: '#FF3B30', fontSize: 15, fontWeight: 500 }}>
            Событие отменено
          </Typography>
        )}
        {status === EventStatus.FINISHED && (
          <Typography sx={{ color: '#007AFF', fontSize: 15, fontWeight: 500 }}>
            Событие завершено
          </Typography>
        )}
        {registrationCanceled && (
          <Typography sx={{ color: '#FF3B30', fontSize: 15, fontWeight: 500 }}>
            Регистрация отменена
          </Typography>
        )}
      </Box>
      <ParticipantsCount>
        <Typography
          component="span"
          sx={{
            fontSize: '17px',
            fontWeight: 500,
            fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
          }}
        >
          <span style={{ color: '#007AFF' }}>{registeredCount}</span>
          <span style={{ color: '#001E2F' }}> из {maxParticipants}</span>
        </Typography>
      </ParticipantsCount>
      {isOrganizer && status !== EventStatus.FINISHED && status !== EventStatus.CANCELED && (
        <Button
          variant="contained"
          size="small"
          sx={{ ml: 2, minWidth: 0, px: 2, fontSize: 14, height: 32 }}
          onClick={handleFinishClick}
        >
          Завершить событие
        </Button>
      )}
    </Box>
  );
};

export default EventCard;
