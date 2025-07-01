import React from 'react';
import { Typography, Box, Avatar, Paper, IconButton, Dialog, DialogTitle, DialogContent, TextField, Button } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon, Settings as SettingsIcon, Close as CloseIcon, People as PeopleIcon } from '@mui/icons-material';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  text: string;
  avatar?: string;
}

const reviews: Review[] = [
  {
    id: 1,
    author: 'Мария',
    date: '04.06.2025',
    rating: 5,
    text: 'Интересное событие. Гид красавчик. Пойду ещё раз на такое классное событие и своим знакомым расскажу о нём',
    avatar: 'https://example.com/avatar1.jpg',
  },
];

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
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [maxParticipants, setMaxParticipants] = React.useState('30');
  const [donation, setDonation] = React.useState('500 динар');
  const navigate = useNavigate();

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
          p: 4,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'row',
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
            mb: 2,
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/rate-organizer/${user.id}`)}
        />
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
          p: 1,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography>Рейтинг инициатора события</Typography>
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
          4.8
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
            fontSize: '16px',
            fontWeight: 500,
            mb: 2,
          }}
        >
          Отзывы
        </Typography>
        {reviews.map((review) => (
          <Paper
            key={review.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '12px',
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
      </Box>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ position: 'relative', pr: 5 }}>
          Значения по умолчанию для ваших событий:
          <IconButton
            aria-label="close"
            onClick={() => setSettingsOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Максимум участников"
              value={maxParticipants}
              onChange={e => setMaxParticipants(e.target.value)}
              InputProps={{
                startAdornment: (
                  <PeopleIcon sx={{ mr: 1 }} />
                ),
              }}
              fullWidth
            />
            <TextField
              label="Ожидаемый размер доната"
              value={donation}
              onChange={e => setDonation(e.target.value)}
              InputProps={{
                startAdornment: (
                  <StarIcon sx={{ mr: 1 }} />
                ),
              }}
              fullWidth
            />
            <Button
              variant="contained"
              sx={{ mt: 2 }}
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
