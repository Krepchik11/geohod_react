import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, TextField, Button, IconButton } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const RateOrganizerPage: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const { id } = useParams<{ id: string }>();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const navigate = useNavigate();

  // Telegram BackButton
  useEffect(() => {
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.show();
      const handler = () => navigate(-1);
      window.Telegram.WebApp.BackButton.onClick(handler);
      return () => {
        window.Telegram.WebApp.BackButton.hide();
        window.Telegram.WebApp.BackButton.offClick(handler);
      };
    }
  }, [navigate]);

  // TODO: здесь должен быть запрос на получение данных пользователя по id
  // Пока используем user как заглушку
  const organizer = user; // заменить на реальные данные по id

  if (!organizer) return null;

  const isSelf = user && id === String(user.id);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {/* Telegram BackButton теперь нативный, кастомную кнопку убираем */}
        <Typography sx={{ fontWeight: 500, fontSize: 20 }}>
          Оценка организатора
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <Avatar
          src={organizer.photo_url}
          alt={organizer.first_name}
          sx={{ width: 96, height: 96, mb: 1 }}
        />
        <Typography sx={{ fontWeight: 600, fontSize: 22 }}>
          {organizer.first_name} {organizer.last_name}
        </Typography>
        {organizer.username && (
          <Typography sx={{ color: '#8E8E93', fontSize: 16 }}>
            @{organizer.username}
          </Typography>
        )}
        <Typography sx={{ mt: 1, fontWeight: 500, fontSize: 16 }}>
          Общий рейтинг
          <StarIcon sx={{ color: '#007AFF', width: 16, height: 16, ml: 1, mr: 0.5 }} />
          4.8
        </Typography>
      </Box>
      {isSelf ? (
        <Box>
          {/* Здесь будет список отзывов о себе */}
          <Typography sx={{ fontWeight: 500, fontSize: 16, mb: 2 }}>
            Ваши отзывы
          </Typography>
          {/* TODO: вывести отзывы о себе */}
          <Typography sx={{ color: '#8E8E93' }}>Здесь будут отзывы других пользователей о вас.</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 500, fontSize: 16, mb: 1 }}>Оцените</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  sx={{ p: 0 }}
                >
                  {star <= (hover || rating) ? (
                    <StarIcon sx={{ color: '#FFB800', width: 32, height: 32 }} />
                  ) : (
                    <StarBorderIcon sx={{ color: '#FFB800', width: 32, height: 32 }} />
                  )}
                </IconButton>
              ))}
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 500, fontSize: 16, mb: 1, display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ marginRight: 6 }}><path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Напишите отзыв
            </Typography>
            <TextField
              multiline
              minRows={3}
              placeholder="Заблудились в лесу. Спали по ёлкой. Организатор плакал..."
              value={review}
              onChange={e => setReview(e.target.value)}
              fullWidth
              sx={{ bgcolor: '#fff', borderRadius: 2 }}
            />
          </Box>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2, height: 48, fontSize: 18 }}
            disabled={rating === 0 || !review.trim()}
            onClick={() => {/* TODO: отправка отзыва */}}
          >
            Отправить
          </Button>
        </>
      )}
    </Box>
  );
};

export default RateOrganizerPage; 