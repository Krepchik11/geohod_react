import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Avatar,
  Paper,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { api } from '../../api/telegramApi';
import Toast from '../../components/Toast/Toast';
import TopBar from '../../components/TopBar/TopBar';

interface ReviewData {
  rating: number;
  text: string;
}

const ReviewPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useUserStore((state) => state.user);

  const [eventId, setEventId] = useState<string>('');
  const [event, setEvent] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    text: '',
  });
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ isVisible: false, message: '', type: 'success' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Получаем параметр из URL или из Telegram Web App
        const startParam = searchParams.get('startapp') || 
                          searchParams.get('start_param') || 
                          window.Telegram?.WebApp?.initDataUnsafe?.start_param || '';
        
        console.log('ReviewPage: startParam =', startParam);

        if (!startParam.startsWith('review_')) {
          setToast({
            isVisible: true,
            message: 'Неверная ссылка для отзыва',
            type: 'error',
          });
          return;
        }

        // Пытаемся извлечь eventId из разных форматов ссылки
        let extractedEventId = '';
        
        // Формат: review_f0f7e348-f3c2-464e-8f60-a703abfe0b73 (UUID)
        const eventIdMatch1 = startParam.match(/review_([a-f0-9-]{36})/);
        if (eventIdMatch1) {
          extractedEventId = eventIdMatch1[1];
        }
        
        // Формат: review_&_event_123 (числовой ID)
        if (!extractedEventId) {
          const eventIdMatch2 = startParam.match(/&_event_(\d+)/);
          if (eventIdMatch2) {
            extractedEventId = eventIdMatch2[1];
          }
        }
        
        // Формат: review_123 (числовой ID)
        if (!extractedEventId) {
          const eventIdMatch3 = startParam.match(/review_(\d+)/);
          if (eventIdMatch3) {
            extractedEventId = eventIdMatch3[1];
          }
        }
        
        // Формат: review_event_123 (числовой ID)
        if (!extractedEventId) {
          const eventIdMatch4 = startParam.match(/review_event_(\d+)/);
          if (eventIdMatch4) {
            extractedEventId = eventIdMatch4[1];
          }
        }
        
        if (!extractedEventId) {
          setToast({
            isVisible: true,
            message: 'Не найден ID события в ссылке',
            type: 'error',
          });
          return;
        }
        setEventId(extractedEventId);
        
        console.log('ReviewPage: extracted eventId =', extractedEventId);
        console.log('ReviewPage: URL search params =', Object.fromEntries(searchParams.entries()));

        const eventResponse = await api.events.getEventById(extractedEventId);
        setEvent(eventResponse);

        try {
          const reviewResponse = await api.reviews.getMyReview(extractedEventId);
          if (reviewResponse.result !== 'ERROR') {
            setExistingReview(reviewResponse.data);
            setReviewData({
              rating: reviewResponse.data.rating || 0,
              text: reviewResponse.data.text || '',
            });
          }
        } catch (error) {
          console.log('Отзыв не найден');
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setToast({
          isVisible: true,
          message: 'Ошибка при загрузке данных',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const handleRatingChange = (newValue: number | null) => {
    setReviewData((prev) => ({
      ...prev,
      rating: newValue || 0,
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReviewData((prev) => ({
      ...prev,
      text: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!event || !user) return;

    if (reviewData.rating === 0) {
      setToast({
        isVisible: true,
        message: 'Пожалуйста, поставьте оценку',
        type: 'error',
      });
      return;
    }

    if (!reviewData.text.trim()) {
      setToast({
        isVisible: true,
        message: 'Пожалуйста, напишите отзыв',
        type: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);

      const reviewPayload = {
        eventId: eventId,
        rating: reviewData.rating,
        comment: reviewData.text.trim(),
      };
      
      console.log('ReviewPage: sending review payload =', reviewPayload);

      await api.reviews.postReview(reviewPayload);

      setToast({
        isVisible: true,
        message: existingReview ? 'Отзыв обновлен' : 'Отзыв отправлен',
        type: 'success',
      });

      setTimeout(() => {
        navigate('/events');
      }, 2000);
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      setToast({
        isVisible: true,
        message: 'Ошибка при отправке отзыва',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
        <TopBar title="Отзыв" showBackButton={false} showNotifications={false} />
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
        <TopBar title="Ошибка" showBackButton={false} showNotifications={false} />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography sx={{ color: theme.palette.text.primary }}>Событие не найдено</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <TopBar title="Отзыв" showBackButton={false} showNotifications={false} />

      <Box sx={{ p: 1 }}>
        <Box sx={{ p: 2, mb: 2, bgcolor: theme.palette.background.default, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, fontSize: 17 }}>
            {event.name}
          </Typography>

          <Typography sx={{ mb: 1, color: theme.palette.text.secondary, fontSize: 14 }}>
            {formatDate(event.date)}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar src={event.author?.tgImageUrl} sx={{ width: 40, height: 40, mr: 2 }} />
            <Box>
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: 14 }}>
              {event.author?.name}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2, bgcolor: theme.palette.background.default }}>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
            {existingReview ? 'Обновить отзыв' : 'Оставить отзыв'}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, color: theme.palette.text.primary }}>Оценка</Typography>
            <Rating
              value={reviewData.rating}
              onChange={(_, newValue) => handleRatingChange(newValue)}
              size="large"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: theme.palette.primary.main,
                },
                '& .MuiRating-iconHover': {
                  color: theme.palette.primary.main,
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, color: theme.palette.text.primary }}>Комментарий</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={reviewData.text}
              onChange={handleTextChange}
              placeholder="Расскажите о своем опыте участия в событии..."
              variant="outlined"
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '& fieldset': {
                    border: `1px solid ${theme.palette.divider}`,
                  },
                },
              }}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || reviewData.rating === 0 || !reviewData.text.trim()}
            sx={{
              height: 48,
              borderRadius: '14px',
              textTransform: 'none',
              fontSize: 16,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
              '&:disabled': {
                bgcolor: theme.palette.action.disabled,
              },
            }}
          >
            {submitting ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : existingReview ? (
              'Обновить отзыв'
            ) : (
              'Отправить отзыв'
            )}
          </Button>
        </Box>
      </Box>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </Box>
  );
};

export default ReviewPage;
