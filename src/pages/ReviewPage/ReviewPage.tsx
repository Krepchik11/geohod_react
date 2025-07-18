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

        const startParam = searchParams.get('startapp') || '';
        
        if (!startParam.startsWith('review_')) {
          setToast({
            isVisible: true,
            message: 'Неверная ссылка для отзыва',
            type: 'error',
          });
          return;
        }

        const eventIdMatch = startParam.match(/&_event_(\d+)/);
        if (!eventIdMatch) {
          setToast({
            isVisible: true,
            message: 'Не найден ID события',
            type: 'error',
          });
          return;
        }

        const extractedEventId = eventIdMatch[1];
        setEventId(extractedEventId);

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
    setReviewData(prev => ({
      ...prev,
      rating: newValue || 0,
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReviewData(prev => ({
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
        userId: event.author.id,
        rating: reviewData.rating,
        text: reviewData.text.trim(),
      };

      await api.reviews.postReview(reviewPayload);

      setToast({
        isVisible: true,
        message: existingReview ? 'Отзыв обновлен' : 'Отзыв отправлен',
        type: 'success',
      });

      setTimeout(() => {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.close();
        }
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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
          <Typography sx={{ color: theme.palette.text.primary }}>
            Событие не найдено
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <TopBar title="Отзыв" showBackButton={false} showNotifications={false} />
      
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
            {event.name}
          </Typography>
          
          <Typography sx={{ mb: 1, color: theme.palette.text.secondary }}>
            {formatDate(event.date)}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={event.author?.tgImageUrl} 
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Box>
              <Typography sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                {event.author?.firstName} {event.author?.lastName}
              </Typography>
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: 14 }}>
                Организатор события
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
            {existingReview ? 'Обновить отзыв' : 'Оставить отзыв'}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, color: theme.palette.text.primary }}>
              Оценка
            </Typography>
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
            <Typography sx={{ mb: 1, color: theme.palette.text.primary }}>
              Комментарий
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={reviewData.text}
              onChange={handleTextChange}
              placeholder="Расскажите о своем опыте участия в событии..."
              variant="outlined"
              sx={{
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
            ) : (
              existingReview ? 'Обновить отзыв' : 'Отправить отзыв'
            )}
          </Button>
        </Paper>
      </Box>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </Box>
  );
};

export default ReviewPage; 