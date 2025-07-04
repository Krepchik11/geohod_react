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
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { reviewsApi } from '../../api/telegramApi';

interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  text: string;
  avatar?: string;
  hidden: boolean;
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

const ProfilePage: React.FC = () => {
  const user = useUserStore((state) => state.user);
  console.log('user:', user);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [maxParticipants, setMaxParticipants] = React.useState('30');
  const [donation, setDonation] = React.useState('500 динар');
  const navigate = useNavigate();
  const userId = user?.uuid;
  const isOwnProfile = user && user.uuid === userId;

  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingReviews, setLoadingReviews] = React.useState(false);
  const loaderRef = React.useRef<HTMLDivElement | null>(null);

  const [rating, setRating] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user || !user.uuid) return;
    setLoading(true);
    const userIdStr = String(user.uuid);
    Promise.all([
      reviewsApi.getUserReviews(userIdStr, 0, 10),
      reviewsApi.getUserRating(userIdStr)
    ]).then(([reviews, rating]) => {
      setReviews(reviews);
      setRating(rating);
      setLoading(false);
    });
  }, [user]);

  React.useEffect(() => {
    setReviews([]);
    setPage(0);
    setHasMore(true);
  }, [user]);

  React.useEffect(() => {
    const loadReviews = async () => {
      if (!user || !user.uuid || loadingReviews || !hasMore) return;
      setLoadingReviews(true);
      const res = await reviewsApi.getUserReviews(user.uuid, page, 10);
      const newReviews = Array.isArray(res) ? res : res.data || [];
      setReviews(prev => [...prev, ...newReviews]);
      setHasMore(newReviews.length === 10);
      setLoadingReviews(false);
    };
    loadReviews();
    // eslint-disable-next-line
  }, [page, user]);

  React.useEffect(() => {
    if (!hasMore || loadingReviews) return;
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, loadingReviews]);

  const handleToggleReviewVisibility = async (review: Review) => {
    const userIdStr = String(userId);
    if (review.hidden) {
      await reviewsApi.unhideReview(String(review.id));
    } else {
      await reviewsApi.hideReview(String(review.id));
    }
    const updated = await reviewsApi.getUserReviews(userIdStr, 0, 10);
    setReviews(updated);
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
        <Avatar
          src={user.photo_url}
          alt={user.first_name}
          sx={{
            width: 120,
            height: 120,
            mb: 1,
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/rate-organizer/${user.id}`)}
        />
        <Typography sx={{ fontWeight: 600, fontSize: 20, mt: 1 }}>
          {user.first_name} {user.last_name}
        </Typography>
        <Typography sx={{ color: '#8E8E93', fontSize: 15, mb: 1 }}>@{user.username}</Typography>
        <IconButton
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            background: '#fff',
            boxShadow: 1,
          }}
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon />
        </IconButton>
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
        <Typography sx={{ fontSize: '14px', fontWeight: '500' }}>
          Рейтинг инициатора события
        </Typography>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StarIcon sx={{ color: '#007AFF', width: '12px', height: '12px', marginRight: '6px' }} />
          {Number(rating) ? Number(rating).toFixed(1) : '-'}
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
        {reviews.map((review) => (
          <Paper
            key={review.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '12px',
              position: 'relative',
              opacity: review.hidden ? 0.5 : 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                src={review.avatar}
                alt={review.author}
                sx={{ width: 40, height: 40, mr: 2 }}
              />
              <Box>
                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  {review.author}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#8E8E93',
                  }}
                >
                  {review.date}
                </Typography>
              </Box>
              {isOwnProfile && (
                <Box sx={{ position: 'absolute', right: 12, top: 12 }}>
                  <IconButton onClick={() => handleToggleReviewVisibility(review)}>
                    {review.hidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Box>
              )}
            </Box>
            <RatingStars rating={review.rating} />
            <Typography
              sx={{
                fontSize: '14px',
                lineHeight: '20px',
              }}
            >
              {review.text}
            </Typography>
          </Paper>
        ))}
        {loadingReviews && <Typography>Загрузка...</Typography>}
        {hasMore && <div ref={loaderRef} style={{ height: 20 }} />}
      </Box>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ position: 'relative', pr: 5, fontSize: '14px', fontWeight: '400' }}>
          Значения по умолчанию для ваших событий:
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Максимум участников"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              InputProps={{
                startAdornment: <PeopleIcon sx={{ mr: 1 }} />,
              }}
              fullWidth
            />
            <TextField
              label="Ожидаемый размер доната"
              value={donation}
              onChange={(e) => setDonation(e.target.value)}
              InputProps={{
                startAdornment: <StarIcon sx={{ mr: 1 }} />,
              }}
              fullWidth
            />
            <Button
              sx={{ mt: 2, backgroundColor: '#007AFF', color: '#fff' }}
              onClick={() => setSettingsOpen(false)}
              fullWidth
            >
              Применить
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
