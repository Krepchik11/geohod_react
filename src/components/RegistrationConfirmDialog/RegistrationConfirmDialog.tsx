import React from 'react';
import { Dialog, DialogContent, Button, Typography, Avatar, Box } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';
import { Event } from '../../api';
import StarIcon from '@mui/icons-material/Star';

interface RegistrationConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
}

const RegistrationConfirmDialog: React.FC<RegistrationConfirmDialogProps> = ({
  open,
  onClose,
  event,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 3, pb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 400, mb: 2 }}>
          Вы успешно зарегистрировались на событие
        </Typography>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>{event?.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EventIcon sx={{ fontSize: 20, color: '#8E8E93', mr: 1 }} />
          <Typography sx={{ fontSize: 14 }}>{event && formatDate(event.date)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={event?.author?.tgImageUrl} sx={{ width: 32, height: 32, mr: 1 }} />
          <Box>
            <Typography sx={{ fontSize: 14, color: '#8E8E93', mb: 0.5 }}>
              Инициатор события
            </Typography>
            <Typography sx={{ fontWeight: 500, fontSize: 15 }}>
              {event?.author?.firstName} {event?.author?.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ color: '#007AFF', width: '16px', height: '16px' }} />
              <Typography sx={{ fontSize: 14, color: '#8E8E93' }}>4.8</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            component="a"
            href={event?.author?.tgUsername ? `https://t.me/${event.author.tgUsername}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              ml: 2,
              borderRadius: '20px',
              fontSize: 14,
              fontWeight: 500,
              minWidth: 90,
              height: 36,
              textTransform: 'none',
              boxShadow: 'none',
              bgcolor: '#007AFF',
              '&:hover': { bgcolor: '#0056b3' },
              marginLeft: 'auto',
            }}
            disabled={!event?.author?.tgUsername}
          >
            Связаться
          </Button>
        </Box>
        <Typography sx={{ fontSize: 14, color: 'black', mb: 1 }}>
          Человек в группе: <span style={{ color: '#007AFF' }}>{event?.participantsCount}</span> из{' '}
          {event?.maxParticipants}
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          sx={{
            height: 48,
            borderRadius: '14px',
            fontSize: 16,
            textTransform: 'none',
            mt: 2,
            color: '#006FFD',
            border: '1.5px solid #006FFD',
            '&:hover': {
              bgcolor: '#006FFD',
              color: '#fff',
            },
          }}
          onClick={onClose}
        >
          Закрыть
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationConfirmDialog;
