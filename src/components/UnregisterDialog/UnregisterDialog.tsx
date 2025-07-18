import React from 'react';
import { Dialog, DialogContent, Button, Typography, Avatar, Box, useTheme } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';
import { Event } from '../../api';
import StarIcon from '@mui/icons-material/Star';

interface UnregisterDialogProps {
  open: boolean;
  onClose: () => void;
  onUnregister: () => Promise<void>;
  event: Event | null;
  loading?: boolean;
}

const UnregisterDialog: React.FC<UnregisterDialogProps> = ({
  open,
  onClose,
  onUnregister,
  event,
  loading,
}) => {
  const theme = useTheme();

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
        <Typography
          sx={{ fontSize: 14, fontWeight: 400, mb: 2, color: theme.palette.text.primary }}
        >
          Вы уверены, что хотите отменить регистрацию на событие?
        </Typography>
        <Typography
          sx={{ fontSize: 17, fontWeight: 700, mb: 1, color: theme.palette.text.primary }}
        >
          {event?.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EventIcon sx={{ fontSize: 20, color: theme.palette.text.secondary, mr: 1 }} />
          <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary }}>
            {event && formatDate(event.date)}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary, mb: 0.5 }}>
          Инициатор события
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={event?.author?.tgImageUrl} sx={{ width: 32, height: 32, mr: 1 }} />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14, color: theme.palette.text.primary }}>
              {event?.author?.firstName} {event?.author?.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ color: theme.palette.primary.main, width: '16px', height: '16px' }} />
              <Typography sx={{ fontSize: 14, color: theme.palette.text.secondary }}>
                4.8
              </Typography>
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
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.dark },
              marginLeft: 'auto',
            }}
            disabled={!event?.author?.tgUsername}
          >
            Связаться
          </Button>
        </Box>
        <Typography sx={{ fontSize: 14, color: theme.palette.text.primary, mb: 1 }}>
          Человек в группе:{' '}
          <span style={{ color: theme.palette.primary.main }}>{event?.participantsCount}</span> из{' '}
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
            color: theme.palette.primary.main,
            border: `1.5px solid ${theme.palette.primary.main}`,
            '&:hover': {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
          onClick={async () => {
            try {
              await onUnregister();
              onClose();
            } catch (error) {
              console.error('Error during unregistration:', error);
            }
          }}
          disabled={loading}
        >
          Отменить регистрацию
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UnregisterDialog;
