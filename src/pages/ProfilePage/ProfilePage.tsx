import React from 'react';
import {
  Typography,
  Box,
  Avatar,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  useTheme,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import settingsIcon from '../../assets/icons/settings.svg';
import { useUserStore } from '../../store/userStore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api, reviewsApi, userSettingsApi } from '../../api/telegramApi';
import Toast from '../../components/Toast/Toast';
import visibleIcon from '../../assets/icons/visible.svg';
import invisibleIcon from '../../assets/icons/invisible.svg';

interface Review {
  id: string;
  eventId: string;
  authorId: string;
  authorUsername: string;
  authorImageUrl: string | null;
  rating: number;
  comment: string;
  isHidden: boolean;
  createdAt: string;
}

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <Box sx={{ display: 'flex', gap: '2px', my: 1 }}>
      {[1, 2, 3, 4, 5].map((star) =>
        star <= rating ? (
          <StarIcon key={star} sx={{ color: '#FFB800', width: 20, height: 20 }} />
        ) : (
          <StarBorderIcon key={star} sx={{ color: '#FFB800', width: 20, height: 20 }} />
        )
      )}
    </Box>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Только что';
  } else if (diffInHours < 24) {
    return `${diffInHours} ч. назад`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return 'Вчера';
    } else if (diffInDays < 7) {
      return `${diffInDays} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }
};

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [maxParticipants, setMaxParticipants] = React.useState('');
  const [maxParticipantsError, setMaxParticipantsError] = React.useState<string | null>(null);
  const [donation, setDonation] = React.useState('');
  const [toast, setToast] = React.useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ isVisible: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const targetUserId = urlUserId || user?.uuid;
  const isOwnProfile = !urlUserId || (user && user.uuid === urlUserId);

  // Получаем данные автора из state, если они были переданы
  const authorData = location.state?.authorData;

  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingReviews, setLoadingReviews] = React.useState(false);
  const loaderRef = React.useRef<HTMLDivElement | null>(null);

  const [rating, setRating] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [targetUser, setTargetUser] = React.useState<any>(null);

  const settings = useUserStore((state) => state.settings);
  const setSettings = useUserStore((state) => state.setSettings);
  const fetchSettings = useUserStore((state) => state.fetchSettings);

  React.useEffect(() => {
    if (!targetUserId) return;
    setLoading(true);

    const loadUserData = async () => {
      try {
        if (isOwnProfile) {
          setTargetUser(user);
        } else {
          // Загружаем данные другого пользователя

          // Если у нас есть данные автора из state, используем их
          if (authorData) {
            setTargetUser(authorData);
          } else {
            // Иначе загружаем данные через API
            try {
              const userResponse = await api.users.getUserById(targetUserId);
              setTargetUser(userResponse.data);
            } catch (error) {
              console.error('Error loading user by ID, trying alternative method:', error);

              // Попробуем получить данные пользователя через getUserByTelegramId
              // Но сначала нужно получить числовой Telegram ID из UUID
              try {
                // Попробуем найти пользователя в событиях, чтобы получить его числовой ID
                const eventsResponse = await api.events.getAllEvents({ page: 0, size: 50 });
                const userEvent = eventsResponse.content?.find((event: any) => {
                  const authorUuid = (event.author as any)?.uuid;
                  return authorUuid === targetUserId;
                });

                if (userEvent?.author?.id) {
                  const telegramUserResponse = await api.users.getUserByTelegramId(
                    userEvent.author.id
                  );
                  if (telegramUserResponse.data) {
                    setTargetUser(telegramUserResponse.data);
                    return;
                  }
                }
              } catch (telegramError) {
                console.error(
                  'Error loading user by Telegram ID, trying events method:',
                  telegramError
                );

                // Если не удалось получить через Telegram ID, используем данные из событий напрямую
                try {
                  const eventsResponse = await api.events.getAllEvents({ page: 0, size: 50 });
                  const userEvent = eventsResponse.content?.find((event: any) => {
                    const authorUuid = (event.author as any)?.uuid;
                    return authorUuid === targetUserId;
                  });

                  if (userEvent?.author) {
                    setTargetUser(userEvent.author);
                  } else {
                    console.error('User not found in events, targetUserId:', targetUserId);
                  }
                } catch (eventsError) {
                  console.error('Error loading user through events:', eventsError);
                }
              }
            }
          }
        }

        // Загружаем рейтинг
        try {
          const ratingResponse = await reviewsApi.getUserRating(String(targetUserId));
          setRating(ratingResponse.data);
        } catch (ratingError) {
          console.error(
            'ProfilePage: error fetching rating, trying alternative method:',
            ratingError
          );
          // Если это числовой ID, попробуем получить UUID через getUserByTelegramId
          if (/^\d+$/.test(targetUserId)) {
            try {
              const userResponse = await api.users.getUserByTelegramId(targetUserId);
              const ratingResponse = await reviewsApi.getUserRating(userResponse.data.id);
              setRating(ratingResponse.data);
            } catch (uuidError) {
              console.error('ProfilePage: could not get UUID for rating:', uuidError);
              setRating(0);
            }
          } else {
            setRating(0);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [targetUserId, isOwnProfile, user]);

  React.useEffect(() => {
    setReviews([]);
    setPage(0);
    setHasMore(true);
  }, [targetUserId]);

  React.useEffect(() => {
    const loadReviews = async () => {
      if (!targetUserId || loadingReviews || !hasMore) return;
      setLoadingReviews(true);

      let res;
      try {
        res = await reviewsApi.getUserReviews(targetUserId, page, 10);
      } catch (reviewsError) {
        console.error(
          'ProfilePage: error fetching reviews, trying alternative method:',
          reviewsError
        );
        // Если это числовой ID, попробуем получить UUID через getUserByTelegramId
        if (/^\d+$/.test(targetUserId)) {
          try {
            const userResponse = await api.users.getUserByTelegramId(targetUserId);
            res = await reviewsApi.getUserReviews(userResponse.data.id, page, 10);
          } catch (uuidError) {
            console.error('ProfilePage: could not get UUID for reviews:', uuidError);
            res = { data: [] };
          }
        } else {
          res = { data: [] };
        }
      }
      let newReviews = res && Array.isArray(res.data) ? res.data : [];

      // Для чужих профилей показываем только видимые отзывы
      if (!isOwnProfile) {
        newReviews = newReviews.filter((review: Review) => !review.isHidden);
      }

      // Дедупликация отзывов по ID
      setReviews((prev) => {
        const existingIds = new Set(prev.map((review: Review) => review.id));
        const uniqueNewReviews = newReviews.filter((review: Review) => !existingIds.has(review.id));
        return [...prev, ...uniqueNewReviews];
      });

      setHasMore(newReviews.length === 10);
      setLoadingReviews(false);
    };
    loadReviews();
    // eslint-disable-next-line
  }, [page, targetUserId]);

  // Intersection Observer для пагинации
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingReviews) {
          setPage((prev) => prev + 1);
        }
      },
      {
        rootMargin: '100px',
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loadingReviews]);

  React.useEffect(() => {
    fetchSettings();
  }, []);

  React.useEffect(() => {
    if (settings) {
      setMaxParticipants(
        settings.defaultMaxParticipants === null ? '' : String(settings.defaultMaxParticipants)
      );
      setDonation(settings.defaultDonationAmount === null ? '' : settings.defaultDonationAmount);
    }
  }, [settings]);

  React.useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, isVisible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.isVisible]);

  const handleToggleReviewVisibility = async (review: Review) => {
    try {
      if (review.isHidden) {
        await reviewsApi.unhideReview(review.id);
      } else {
        await reviewsApi.hideReview(review.id);
      }
      // После успешного запроса — перезапрашиваем отзывы с первой страницы
      const res = await reviewsApi.getUserReviews(targetUserId!, 0, (page + 1) * 10);
      const newReviews = res && Array.isArray(res.data) ? res.data : [];

      // Дедупликация отзывов по ID
      const existingIds = new Set<string>();
      const uniqueReviews = newReviews.filter((review: Review) => {
        if (existingIds.has(review.id)) {
          return false;
        }
        existingIds.add(review.id);
        return true;
      });

      setReviews(uniqueReviews);
    } catch (e) {
      setToast({ isVisible: true, message: 'Ошибка при изменении видимости', type: 'error' });
    }
  };

  const handleApplySettings = async () => {
    const data = {
      defaultDonationAmount: donation,
      defaultMaxParticipants:
        maxParticipants === '' ? settings?.defaultMaxParticipants || 30 : Number(maxParticipants),
    };
    const res = await userSettingsApi.updateSettings(data);
    if (res.result === 'SUCCESS') {
      setSettings(res.data);
      setSettingsOpen(false);
      setToast({
        isVisible: true,
        message: 'Настройки успешно сохранены',
        type: 'success',
      });
    }
  };

  const handleMaxParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setMaxParticipants('');
      setMaxParticipantsError(null);
      return;
    }
    const num = Number(value);
    if (num > 99) {
      setToast({
        isVisible: true,
        message: 'Максимум 99 участников',
        type: 'error',
      });
      setMaxParticipants('99');
      setMaxParticipantsError('Максимум 99 участников');
      return;
    }
    if (num < 1) {
      setMaxParticipants(value);
      setMaxParticipantsError('Минимум 1 участник');
      return;
    }
    setMaxParticipants(value);
    setMaxParticipantsError(null);
  };

  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} />
      <Box
        sx={{
          p: 0,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Debug log */}
        <Avatar
          src={targetUser?.photo_url || targetUser?.imageUrl}
          alt={targetUser?.first_name || targetUser?.name}
          sx={{
            width: 120,
            height: 120,
            mb: 1,
            ...(isOwnProfile && {
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.8,
              },
            }),
          }}
        />
        <Typography sx={{ fontWeight: 600, fontSize: 20, mt: 1 }}>
          {targetUser?.tgFirstName || targetUser?.first_name || targetUser?.name}{' '}
          {targetUser?.tgLastName || targetUser?.last_name}
        </Typography>
        <Typography sx={{ color: '#8E8E93', fontSize: 15, mb: 1 }}>
          @{targetUser?.username}
        </Typography>
        {isOwnProfile && (
          <IconButton
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              width: 32,
              height: 32,
              p: 0,
            }}
            onClick={() => setSettingsOpen(true)}
          >
            <img src={settingsIcon} alt="Настройки" width={24} height={24} />
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          mt: 1,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography sx={{ fontSize: '14px', fontWeight: '500' }}>Общий рейтинг</Typography>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          {Number(rating) ? Number(rating).toFixed(1) : '0.0'}
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          mt: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            color: '#8E8E93',
            fontWeight: 500,
            mb: 2,
          }}
        >
          Отзывы
        </Typography>
        {reviews.length === 0 && !loadingReviews && <Typography>Нет отзывов</Typography>}
        {reviews.map((review, index) => (
          <Box key={`${review.id}-${index}`} sx={{ position: 'relative', mb: 2 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: '12px',
                position: 'relative',
                opacity: review.isHidden ? 0.5 : 1,
                filter: review.isHidden ? 'blur(1px)' : 'none',
                transition: 'filter 0.2s, opacity 0.2s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  src={review.authorImageUrl}
                  alt={review.authorUsername}
                  sx={{ width: 40, height: 40, mr: 2 }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: '15px',
                      fontWeight: 600,
                    }}
                  >
                    {review.authorUsername}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: '#8E8E93',
                    }}
                  >
                    {formatDate(review.createdAt)}
                  </Typography>
                </Box>
              </Box>
              <RatingStars rating={review.rating} />
              <Typography
                sx={{
                  fontSize: '14px',
                  lineHeight: '20px',
                }}
              >
                {review.comment}
              </Typography>
            </Paper>
            {isOwnProfile && (
              <Box
                sx={{
                  position: 'absolute',
                  right: 20,
                  top: '30%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconButton
                  onClick={() => handleToggleReviewVisibility(review)}
                  sx={{
                    p: 0,
                    background: 'none',
                    '&:hover': { background: 'none' },
                  }}
                >
                  <img
                    src={review.isHidden ? invisibleIcon : visibleIcon}
                    alt={review.isHidden ? 'Скрыто' : 'Видимо'}
                    style={{
                      width: 20,
                      display: 'block',
                      filter:
                        window.Telegram?.WebApp?.colorScheme === 'dark' ? 'invert(1)' : 'none',
                    }}
                  />
                </IconButton>
              </Box>
            )}
          </Box>
        ))}
        {loadingReviews && <Typography>Загрузка...</Typography>}
        {hasMore && <div ref={loaderRef} style={{ height: 20 }} />}
      </Box>
      {isOwnProfile && (
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ position: 'relative', pr: 5, fontSize: '14px', fontWeight: '400' }}>
            Значения по умолчанию для ваших событий:
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Максимум участников"
                value={maxParticipants}
                onChange={handleMaxParticipantsChange}
                placeholder="30"
                fullWidth
                type="number"
                error={!!maxParticipantsError}
                helperText={maxParticipantsError}
                inputProps={{ min: 1, max: 99 }}
              />
              <TextField
                label="Ожидаемый размер доната"
                value={donation}
                onChange={(e) => setDonation(e.target.value)}
                placeholder="500 динар"
                fullWidth
              />
              <Button
                sx={{ mt: 2, backgroundColor: theme.palette.primary.main, color: '#fff' }}
                onClick={handleApplySettings}
                fullWidth
              >
                Применить
              </Button>
            </Box>
            <Box
              sx={{
                position: 'fixed',
                top: 30,
                right: 30,
                zIndex: 10000,
              }}
            >
              <Box
                component="img"
                src="/images/close-popup.svg"
                alt="Close"
                onClick={() => setSettingsOpen(false)}
                sx={{
                  width: 50,
                  height: 50,
                  cursor: 'pointer',
                }}
              />
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default ProfilePage;
