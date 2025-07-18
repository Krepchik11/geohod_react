import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, TextField, Button, IconButton, useTheme } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const RateOrganizerPage: React.FC = () => {
  const theme = useTheme();
  const user = useUserStore((state) => state.user);
  const { id } = useParams<{ id: string }>();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const navigate = useNavigate();

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

  const organizer = user;

  if (!organizer) return null;

  const isSelf = user && id === String(user.id);

  if (isSelf) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <Avatar
          src={organizer.photo_url}
          alt={organizer.first_name}
          sx={{ width: 96, height: 96, mb: 1, mt: 2 }}
        />
        <Typography sx={{ fontWeight: 600, fontSize: 20, color: theme.palette.text.primary }}>
          {organizer.first_name} {organizer.last_name}
        </Typography>
        {organizer.username && (
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 15 }}>
            @{organizer.username}
          </Typography>
        )}
        <Typography
          sx={{ mt: 1, fontWeight: 500, fontSize: 15, color: theme.palette.text.primary }}
        >
          Общий рейтинг
          <StarIcon
            sx={{ color: theme.palette.primary.main, width: 16, height: 16, ml: 1, mr: 0.5 }}
          />
          4.8
        </Typography>
      </Box>
      {isSelf ? (
        <Box>
          <Typography
            sx={{ fontWeight: 500, fontSize: 15, mb: 2, color: theme.palette.text.secondary }}
          >
            Отзывы
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: 14 }}>
            Нет отзывов
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{ fontWeight: 500, fontSize: 15, mb: 1, color: theme.palette.text.primary }}
            >
              Оцените
            </Typography>
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
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: 15,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                color: theme.palette.text.primary,
              }}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                style={{ marginRight: 6 }}
              >
                <path
                  d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"
                  stroke={theme.palette.text.secondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  stroke={theme.palette.text.secondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Напишите отзыв
            </Typography>
            <TextField
              multiline
              minRows={3}
              placeholder="Заблудились в лесу. Спали по ёлкой. Организатор плакал..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              fullWidth
              sx={{ bgcolor: theme.palette.background.paper, borderRadius: 2 }}
            />
          </Box>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2, height: 48, fontSize: 17 }}
            disabled={rating === 0 || !review.trim()}
            onClick={() => {
              /* TODO: отправка отзыва */
            }}
          >
            Отправить
          </Button>
        </>
      )}
    </Box>
  );
};

export default RateOrganizerPage;
