import React from 'react';
import { Box, Typography, Avatar, Button, useTheme } from '@mui/material';
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
  organizerId?: string | number;
  isPast?: boolean;
  status?: EventStatus | string;
  registrationCanceled?: boolean;
}

const ParticipantsCount = styled('div')(({ theme }) => ({
  display: 'inline',
  '& .blue-digit': {
    color: theme.palette.primary.main,
  },
  '& .black-digits': {
    color: theme.palette.text.primary,
  },
}));

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  registeredCount,
  maxParticipants,
  organizerAvatar,
  organizerId,
  isPast = false,
  status,
  registrationCanceled,
}) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const theme = useTheme();

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

  const isOrganizer = user && user.id && organizerId && String(user.id) === String(organizerId);

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

  const showFinishButton =
    isOrganizer && isToday && status !== EventStatus.FINISHED && status !== EventStatus.CANCELED;

  return (
    <Box
      onClick={handleCardClick}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 2,
        p: 2,
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: showFinishButton ? 120 : 'unset',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        opacity: isPast ? 0.5 : 1,
        filter: isPast ? 'grayscale(1)' : 'none',
      }}
    >
      {/* Аватар */}
      <Avatar
        src={organizerAvatar}
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          flexShrink: 0,
        }}
      />

      {/* Основной контент */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.2,
            mb: 0.5,
            fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            maxHeight: '2.4em',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: '14px',
            color: theme.palette.text.secondary,
            fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
          }}
        >
          {formatDateTime(date)}
        </Typography>
        {status === EventStatus.CANCELED && (
          <Typography sx={{ color: theme.palette.error.main, fontSize: 14, fontWeight: 500 }}>
            Событие отменено
          </Typography>
        )}
        {status === EventStatus.FINISHED && (
          <Typography sx={{ color: theme.palette.primary.main, fontSize: 14, fontWeight: 500 }}>
            Событие завершено
          </Typography>
        )}
        {registrationCanceled && (
          <Typography sx={{ color: theme.palette.error.main, fontSize: 14, fontWeight: 500 }}>
            Регистрация отменена
          </Typography>
        )}
      </Box>

      {/* Правая колонка со счетчиком и кнопкой */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          minHeight: showFinishButton ? 60 : 'unset',
          minWidth: showFinishButton ? 50 : 'unset',
          maxWidth: showFinishButton ? 60 : 'unset',
          flexShrink: 0,
        }}
      >
        {/* Счетчик участников */}
        <ParticipantsCount>
          <Typography
            component="span"
            sx={{
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
              whiteSpace: 'nowrap',
              color: theme.palette.text.primary,
            }}
          >
            <span style={{ color: theme.palette.primary.main }}>{registeredCount}</span>
            <span style={{ color: theme.palette.text.secondary }}> из {maxParticipants}</span>
          </Typography>
        </ParticipantsCount>
        {isOrganizer &&
          isToday &&
          status !== EventStatus.FINISHED &&
          status !== EventStatus.CANCELED && (
            <Button
              variant="contained"
              size="small"
              sx={{
                minWidth: 0,
                px: 2,
                fontSize: 14,
                height: 32,
                whiteSpace: 'nowrap',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '20px',
                textTransform: 'none',
                position: 'relative',
                top: 30,
                right: 0,
              }}
              onClick={handleFinishClick}
            >
              Завершить событие
            </Button>
          )}
      </Box>
    </Box>
  );
};

export default EventCard;
