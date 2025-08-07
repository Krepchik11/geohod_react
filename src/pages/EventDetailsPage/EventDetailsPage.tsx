import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Container,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
} from '@mui/material';
import { Event as EventIcon, PeopleAlt as PeopleAltIcon } from '@mui/icons-material';
import { api } from '../../api/telegramApi';
import { Event, EventStatus, User } from '../../api';
import TopBar from '../../components/TopBar/TopBar';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useUserStore } from '../../store/userStore';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import PeopleIcon from '@mui/icons-material/People';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LinkIcon from '@mui/icons-material/Link';
import Toast from '../../components/Toast/Toast';
import StarIcon from '@mui/icons-material/Star';
import CancelEventDialog from '../../components/CancelEventDialog/CancelEventDialog';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import UnregisterDialog from '../../components/UnregisterDialog/UnregisterDialog';
import chatIcon from '../../assets/icons/chat.svg';
import canIcon from '../../assets/icons/can.svg';
import SuccessEventDialog from '../../components/SuccessEventDialog/SuccessEventDialog';
import RegistrationConfirmDialog from '../../components/RegistrationConfirmDialog/RegistrationConfirmDialog';
import RegistrationErrorDialog from '../../components/RegistrationErrorDialog/RegistrationErrorDialog';
import { getRegistrationLink } from '../../config/botConfig';
import { canShowFinishButton } from '../../utils/eventUtils';

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, _setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState<boolean>(false);
  const [operationInProgress, setOperationInProgress] = useState<boolean>(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [registrationErrorDialogOpen, setRegistrationErrorDialogOpen] = useState(false);
  const [registrationErrorMessage, setRegistrationErrorMessage] = useState('');
  const user = useUserStore((state) => state.user);
  const isOrganizer = event && user && String(event.author.id) === String(user.id);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelParticipants, setCancelParticipants] = useState<User[]>([]);
  const [cancelSuccessToast, setCancelSuccessToast] = useState(false);
  const [unregisterDialogOpen, setUnregisterDialogOpen] = useState(false);
  const [iamParticipant, setIamParticipant] = useState(false);
  const [isPast, setIsPast] = useState(false);
  const [authorRating, setAuthorRating] = useState<number | null>(null);
  const theme = useTheme();

  const isCanceled = event?.status === EventStatus.CANCELED;

  const isToday = event
    ? (() => {
        const eventDate = new Date(event.date);
        const now = new Date();
        return eventDate.getTime() === now.getTime();
      })()
    : false;

  useEffect(() => {
    const fetchEventAndParticipants = async () => {
      if (!id || !user?.id) return;
      try {
        const eventData = await api.events.getEventById(id);

        const eventDate = new Date(eventData.date);
        const now = new Date();

        eventDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const isPastEvent = eventDate.getTime() < now.getTime();

        setEvent({
          ...eventData,
          registrationLink: getRegistrationLink(eventData.id),
          participantsCount: eventData.currentParticipants ?? eventData.participantsCount,
          author: {
            ...eventData.author,
            firstName: eventData.author.name ?? eventData.author.firstName,
            tgImageUrl: eventData.author.imageUrl ?? eventData.author.tgImageUrl,
            tgUsername: eventData.author.username ?? eventData.author.tgUsername,
          },
        });

        const participantsData = await api.events.getEventParticipants(id);
        const isParticipant = participantsData.participants.some(
          (p: any) => String(p.tgUserId) === String(user.id)
        );

        setIamParticipant(isParticipant);
        setIsPast(isPastEvent);

        // Загружаем рейтинг автора
        try {
          // Пытаемся получить UUID автора через getUserByTelegramId
          let authorId = eventData.author.id;
          try {
            const userResponse = await api.users.getUserByTelegramId(eventData.author.id);
            authorId = userResponse.data.id; // UUID из ответа
          } catch (uuidError) {
            // Используем оригинальный ID если не удалось получить UUID
          }

          const ratingResponse = await api.reviews.getUserRating(authorId);
          setAuthorRating(ratingResponse.data);
        } catch (error) {
          console.error('Error fetching author rating:', error);
          setAuthorRating(null);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Ошибка при загрузке события');
      } finally {
        setLoading(false);
      }
    };

    if (id && user?.id) {
      setLoading(true);
      fetchEventAndParticipants();
    }
  }, [id, user?.id]);

  const handleRegister = async () => {
    if (!event?.id) return;
    try {
      setOperationInProgress(true);
      await api.events.registerForEvent(event.id);

      const eventData = await api.events.getEventById(event.id);
      setEvent({
        ...eventData,
        registrationLink: getRegistrationLink(eventData.id),
        participantsCount: eventData.currentParticipants ?? eventData.participantsCount,
        author: {
          ...eventData.author,
          firstName: eventData.author.name ?? eventData.author.firstName,
          tgImageUrl: eventData.author.imageUrl ?? eventData.author.tgImageUrl,
          tgUsername: eventData.author.username ?? eventData.author.tgUsername,
        },
      });

      const participantsData = await api.events.getEventParticipants(event.id);
      const isParticipant = participantsData.participants.some(
        (p: any) => String(p.tgUserId) === String(user.id)
      );
      setIamParticipant(isParticipant);
      setRegistrationDialogOpen(true);
    } catch (error: any) {
      console.error('Error registering for event:', error);

      // Определяем сообщение об ошибке
      let errorMessage = 'Произошла ошибка при регистрации';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Проверяем, связана ли ошибка с полной группой
      if (
        errorMessage.includes('группа') ||
        errorMessage.includes('полная') ||
        errorMessage.includes('набрана') ||
        errorMessage.includes('максимум')
      ) {
        setRegistrationErrorMessage(
          'Группа набрана. Регистрация на это событие больше невозможна.'
        );
      } else {
        setRegistrationErrorMessage(errorMessage);
      }

      setRegistrationErrorDialogOpen(true);
    } finally {
      setOperationInProgress(false);
    }
  };

  useEffect(() => {
    const state = location.state as { fromRegistration?: boolean };
    if (state?.fromRegistration) {
      handleRegister();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, handleRegister]);

  const handleUnregister = async () => {
    if (!id || !event) return;
    try {
      setOperationInProgress(true);
      await api.events.unregisterFromEvent(id);
      const eventData = await api.events.getEventById(id);
      setEvent({
        ...eventData,
        registrationLink: getRegistrationLink(eventData.id),
        participantsCount: eventData.currentParticipants ?? eventData.participantsCount,
        author: {
          ...eventData.author,
          firstName: eventData.author.name ?? eventData.author.firstName,
          tgImageUrl: eventData.author.imageUrl ?? eventData.author.tgImageUrl,
          tgUsername: eventData.author.username ?? eventData.author.tgUsername,
        },
      });
      const participantsData = await api.events.getEventParticipants(id);
      const isParticipant = participantsData.participants.some(
        (p: any) => String(p.tgUserId) === String(user.id)
      );
      setIamParticipant(isParticipant);
      setUnregisterDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Ошибка при отмене регистрации');
      console.error('Unregister error:', err);
    } finally {
      setOperationInProgress(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCopyLink = async () => {
    if (!event?.registrationLink) return;
    try {
      await navigator.clipboard.writeText(event.registrationLink);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      const tempInput = document.createElement('input');
      tempInput.value = event.registrationLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }
  };

  const handleOpenCancelDialog = async () => {
    if (!event) return;
    try {
      const response = await api.events.getEventParticipants(event.id);
      setCancelParticipants(response.participants || []);
      setCancelDialogOpen(true);
    } catch (e) {
      setCancelParticipants([]);
      setCancelDialogOpen(true);
    }
  };

  const handleCancelEvent = async (notify: boolean) => {
    if (!event) return;
    try {
      await api.events.cancelEvent(event.id);
      setCancelDialogOpen(false);
      setCancelSuccessToast(true);
      setTimeout(() => setCancelSuccessToast(false), 2500);
      setEvent((prev) => (prev ? { ...prev, status: EventStatus.CANCELED } : prev));
    } catch (e) {
      setCancelDialogOpen(false);
    }
  };

  const handleRepeatEvent = () => {
    if (event) {
      navigate('/create-event', { state: { title: event.name } });
    }
  };

  const handleEditEvent = () => {
    if (event) {
      navigate(`/edit-event/${event.id}`);
    }
  };

  const handleAuthorProfileClick = async () => {
    if (event) {
      // Пытаемся получить UUID автора через getUserByTelegramId
      let authorId = event.author.id;
      try {
        const userResponse = await api.users.getUserByTelegramId(event.author.id);
        authorId = userResponse.data.id; // UUID из ответа
      } catch (uuidError) {
        // Используем оригинальный ID если не удалось получить UUID
      }

      // Передаем данные автора через state, чтобы не загружать их заново
      const authorDataToPass = {
        id: event.author.id,
        uuid: authorId,
        username: event.author.tgUsername,
        firstName: event.author.firstName,
        lastName: event.author.lastName,
        tgImageUrl: event.author.tgImageUrl,
        imageUrl: event.author.tgImageUrl,
        name: event.author.firstName,
        tgFirstName: event.author.firstName,
        tgLastName: event.author.lastName,
      };

      console.log('EventDetailsPage: passing author data:', authorDataToPass);

      navigate(`/profile/${authorId}`, {
        state: {
          authorData: authorDataToPass,
        },
      });
    }
  };

  return (
    <Box>
      <TopBar
        title={
          iamParticipant
            ? 'Вы зарегистрированы'
            : event?.status === EventStatus.CANCELED
              ? 'Событие отменено'
              : event?.status === EventStatus.FINISHED
                ? 'Событие завершено'
                : isPast
                  ? 'Событие прошло'
                  : 'Регистрация'
        }
        showBackButton
        showNotifications={false}
      />
      <Container maxWidth="sm" sx={{ mt: 1, mb: 1 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box my={2} textAlign="center">
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark },
              }}
            >
              Вернуться на главную
            </Button>
          </Box>
        ) : event ? (
          <Box>
            {!isOrganizer && (
              <>
                <Box
                  sx={{
                    bgcolor: theme.palette.background.default,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    py: 1.5,
                    px: 0,
                    width: '100%',
                    maxWidth: '100vw',
                    boxSizing: 'border-box',
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary, mb: 0.5 }}>
                    Название события
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      maxWidth: '100%',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {event.name}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: theme.palette.background.default,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    py: 1.5,
                    px: 0,
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary, mb: 0.5 }}>
                    Дата
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                    <Typography
                      sx={{ fontSize: 15, fontWeight: 600, color: theme.palette.text.primary }}
                    >
                      {formatDateOnly(event.date)}
                    </Typography>
                  </Box>
                </Box>
                {isPast && false && (
                  <Box
                    sx={{
                      bgcolor: theme.palette.background.default,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                      px: 0,
                    }}
                  >
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: 15 }}>
                      Данное событие завершено
                    </Typography>
                  </Box>
                )}
              </>
            )}
            {event && isOrganizer && (
              <Box>
                <Box
                  sx={{
                    bgcolor: theme.palette.background.default,
                    py: 1.5,
                    px: 0,
                    width: '100%',
                    maxWidth: '100vw',
                    boxSizing: 'border-box',
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary, mb: 0.5 }}>
                    Название события
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      maxWidth: '100%',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {event.name}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: theme.palette.background.default,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        fontFamily: 'Roboto, sans-serif',
                        mb: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LinkIcon
                          sx={{
                            color: theme.palette.text.primary,
                            fontSize: 20,
                            transform: 'rotate(-45deg)',
                          }}
                        />
                      </Box>
                      Копировать ссылку
                    </Typography>
                    <Box
                      onClick={handleCopyLink}
                      sx={{
                        cursor: 'pointer',
                        p: 0.5,
                        borderRadius: '8px',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: theme.palette.primary.main,
                          fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
                          wordBreak: 'break-all',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {event.registrationLink}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Кнопка завершения события */}
                  {isToday &&
                    event.status !== EventStatus.FINISHED &&
                    event.status !== EventStatus.CANCELED && (
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          height: 40,
                          borderRadius: '14px',
                          fontWeight: 600,
                          fontSize: 15,
                          ml: 2,
                        }}
                        onClick={() => navigate(`/finish-event/${event.id}`)}
                      >
                        Завершить событие
                      </Button>
                    )}
                </Box>
              </Box>
            )}
            <Box
              sx={{
                bgcolor: theme.palette.background.default,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ px: 1, pt: 2, pb: 1.5, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary, mb: 0.5 }}>
                  Человек в группе
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleAltIcon sx={{ fontSize: 20, color: theme.palette.text.primary, mr: 1 }} />
                  <Typography
                    sx={{
                      fontSize: 15,
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      mr: 0.5,
                    }}
                  >
                    {event.participantsCount || 0}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 15, color: theme.palette.text.primary, fontWeight: 600 }}
                  >
                    из {event.maxParticipants}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                bgcolor: theme.palette.background.default,
              }}
            >
              <Box
                sx={{
                  maxWidth: 600,
                  margin: '0 auto',
                  px: 1,
                  pt: 2,
                  pb: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary, mb: 0.5 }}>
                  Инициатор события
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Avatar
                    src={event.author.tgImageUrl}
                    alt={event.author.firstName}
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                    onClick={handleAuthorProfileClick}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {event.author.firstName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      <StarIcon
                        sx={{
                          color: theme.palette.primary.main,
                          width: '12px',
                          height: '12px',
                          marginRight: '6px',
                        }}
                      />
                      {authorRating !== null ? authorRating.toFixed(1) : '0.0'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ px: 0, pb: 3, bgcolor: theme.palette.background.default }}>
              {isOrganizer ? (
                <>
                  <Box
                    sx={{
                      mx: '21px',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: theme.palette.action.hover,
                      borderRadius: '16px',
                      px: 2,
                      py: '12px',
                      mb: 1,
                      textDecoration: 'none',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      opacity: 1,
                      pointerEvents: 'auto',
                    }}
                    onClick={handleRepeatEvent}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#A25CE3',
                          borderRadius: '50%',
                          padding: '8px',
                          width: '40px',
                          height: '40px',
                          marginRight: '11px',
                        }}
                      >
                        <ContentCopyIcon sx={{ color: '#FFF', fontSize: 20 }} />
                      </Box>
                      <Typography
                        className="button-text"
                        sx={{
                          color: theme.palette.text.primary,
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 400,
                          fontSize: 16,
                          transition: 'background 0.2s',
                        }}
                      >
                        Повторить событие
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                      <ArrowForwardIosIcon sx={{ color: theme.palette.text.secondary }} />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      minWidth: 200,
                      opacity: event.status === EventStatus.FINISHED || isCanceled ? 0.5 : 1,
                      pointerEvents:
                        event.status === EventStatus.FINISHED || isCanceled ? 'none' : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: theme.palette.action.hover,
                      borderRadius: '16px',
                      px: 2,
                      py: '12px',
                      mb: 1,
                      textDecoration: 'none',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onClick={
                      event.status === EventStatus.FINISHED || isCanceled
                        ? undefined
                        : handleEditEvent
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#FF7B00',
                          borderRadius: '50%',
                          padding: '8px',
                          width: '40px',
                          height: '40px',
                          marginRight: '11px',
                        }}
                      >
                        <BorderColorIcon sx={{ color: '#FFF' }} />
                      </Box>
                      <Typography
                        className="button-text"
                        sx={{
                          color: theme.palette.text.primary,
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 400,
                          fontSize: 16,
                          transition: 'background 0.2s',
                        }}
                      >
                        Редактировать событие
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                      <ArrowForwardIosIcon
                        sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                      />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      minWidth: 200,
                      opacity: 1,
                      pointerEvents: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: theme.palette.action.hover,
                      borderRadius: '16px',
                      px: 2,
                      py: '12px',
                      mb: 1,
                      textDecoration: 'none',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => navigate(`/event/${event.id}/participants`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#2EBC65',
                          borderRadius: '50%',
                          padding: '8px',
                          width: '40px',
                          height: '40px',
                          marginRight: '11px',
                          transition: 'background 0.2s',
                        }}
                      >
                        <PeopleIcon sx={{ color: '#FFF', fontSize: 20 }} />
                      </Box>
                      <Typography
                        className="button-text"
                        sx={{
                          color: theme.palette.text.primary,
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 400,
                          fontSize: 16,
                          transition: 'background 0.2s',
                        }}
                      >
                        Посмотреть участников
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                      <ArrowForwardIosIcon sx={{ color: theme.palette.text.secondary }} />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      minWidth: 200,
                      opacity: event.status === EventStatus.FINISHED || isCanceled ? 0.5 : 1,
                      pointerEvents:
                        event.status === EventStatus.FINISHED || isCanceled ? 'none' : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: theme.palette.action.hover,
                      borderRadius: '16px',
                      px: 2,
                      py: '8px',
                      mb: 1,
                      textDecoration: 'none',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onClick={
                      event.status === EventStatus.FINISHED || isCanceled
                        ? undefined
                        : handleOpenCancelDialog
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#FF0000',
                          borderRadius: '50%',
                          padding: '8px',
                          width: '40px',
                          height: '40px',
                          marginRight: '11px',
                        }}
                      >
                        <DeleteForeverIcon sx={{ color: '#FFF' }} />
                      </Box>
                      <Typography
                        className="button-text"
                        sx={{
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 400,
                          fontSize: 16,
                          transition: 'background 0.2s',
                          color: theme.palette.text.primary,
                        }}
                      >
                        Отменить событие
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                      <ArrowForwardIosIcon
                        sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                      />
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    component="a"
                    href={`https://t.me/${event.author.tgUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: theme.palette.action.hover,
                      borderRadius: '14px',
                      px: 2,
                      py: '8px',
                      mb: 1,
                      textDecoration: 'none',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: theme.palette.primary.main,
                          borderRadius: '50%',
                          padding: '8px',
                          width: '40px',
                          height: '40px',
                          marginRight: '11px',
                        }}
                      >
                        <img
                          src="/assets/icons/chat.svg"
                          alt="Chat"
                          style={{ width: 20, height: 20 }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          color: theme.palette.text.primary,
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 400,
                          fontSize: 16,
                          transition: 'background 0.2s',
                        }}
                      >
                        Задать вопрос
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                      <ArrowForwardIosIcon
                        sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                      />
                    </Box>
                  </Box>
                  {iamParticipant && !isPast && event.status !== EventStatus.FINISHED && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: theme.palette.action.hover,
                        borderRadius: '14px',
                        px: 2,
                        py: '12px',
                        mb: 1,
                        textDecoration: 'none',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => setUnregisterDialogOpen(true)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#FF3B30',
                            borderRadius: '50%',
                            padding: '8px',
                            width: '40px',
                            height: '40px',
                            marginRight: '8px',
                          }}
                        >
                          <img
                            src="/assets/icons/can.svg"
                            alt="Cancel"
                            style={{ width: 20, height: 20 }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            color: '#FF3B30',
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: 400,
                            fontSize: 16,
                            transition: 'background 0.2s',
                          }}
                        >
                          Отменить регистрацию
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                        <ArrowForwardIosIcon
                          sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                        />
                      </Box>
                    </Box>
                  )}
                  {!isOrganizer && !iamParticipant && !isPast && (
                    <Box
                      sx={{
                        width: '100%',
                        bgcolor: theme.palette.background.default,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {event.participantsCount >= event.maxParticipants && (
                        <Typography
                          sx={{
                            color: theme.palette.error.main,
                            fontSize: 14,
                            fontWeight: 500,
                            mb: 2,
                            textAlign: 'center',
                          }}
                        >
                          Регистрация на событие окончена! Группа набрана.
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          marginTop: event.participantsCount >= event.maxParticipants ? 0 : 5,
                          borderRadius: '14px',
                          height: 48,
                          fontSize: 16,
                          textTransform: 'none',
                          fontWeight: 600,
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                        }}
                        onClick={handleRegister}
                        disabled={
                          !user?.id ||
                          operationInProgress ||
                          event.status === EventStatus.CANCELED ||
                          event.participantsCount >= event.maxParticipants
                        }
                      >
                        Зарегистрироваться
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        ) : (
          <Typography>Событие не найдено</Typography>
        )}
      </Container>
      {event && (
        <SuccessEventDialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          eventName={event.name}
          eventDate={formatDate(event.date)}
          registrationLink={event.registrationLink}
        />
      )}
      <RegistrationConfirmDialog
        open={registrationDialogOpen}
        onClose={() => setRegistrationDialogOpen(false)}
        event={event}
        authorRating={authorRating}
      />
      <RegistrationErrorDialog
        open={registrationErrorDialogOpen}
        onClose={() => setRegistrationErrorDialogOpen(false)}
        errorMessage={registrationErrorMessage}
      />
      <CancelEventDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        participants={cancelParticipants}
        onCancel={handleCancelEvent}
      />
      <Toast
        message="Ссылка скопирована"
        isVisible={showCopyToast}
        type="success"
        icon={
          <Box
            sx={{
              bgcolor: '#34C759',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LinkIcon sx={{ color: '#fff', fontSize: 17, transform: 'rotate(-45deg)' }} />
          </Box>
        }
      />
      <UnregisterDialog
        open={unregisterDialogOpen}
        onClose={() => setUnregisterDialogOpen(false)}
        onUnregister={handleUnregister}
        event={event}
        authorRating={authorRating}
      />

      {canShowFinishButton(event, user) && (
        <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              height: 48,
              borderRadius: '14px',
              width: '90%',
              fontWeight: 600,
              fontSize: 17,
              minWidth: 220,
            }}
            onClick={() => navigate(`/finish-event/${event.id}`)}
          >
            Завершить событие
          </Button>
        </Box>
      )}

      {event && iamParticipant && event.status === EventStatus.FINISHED && (
        <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: 18 }}>
            Событие завершено
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EventDetailsPage;
