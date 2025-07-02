import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  Avatar,
} from '@mui/material';

interface Participant {
  id: string;
  firstName: string;
  lastName?: string;
  tgImageUrl?: string;
  imageUrl?: string;
}

interface CancelEventDialogProps {
  open: boolean;
  onClose: () => void;
  participants: Participant[];
  onCancel: (notify: boolean) => void;
}

const CancelEventDialog: React.FC<CancelEventDialogProps> = ({
  open,
  onClose,
  participants,
  onCancel,
}) => {
  const [notify, setNotify] = useState(true);

  return (
    <>
      {open && (
        <Box
          component="img"
          src="/images/close-popup.svg"
          alt="Close"
          onClick={onClose}
          sx={{
            position: 'fixed',
            top: 30,
            right: 30,
            width: 50,
            height: 50,
            cursor: 'pointer',
            zIndex: 10000,
          }}
        />
      )}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            margin: '16px',
            position: 'relative',
          },
        }}
      >
        <DialogContent sx={{ p: 3, pb: 2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 400, mb: 2 }}>
            Вы отменяете событие, на которое записаны люди
          </Typography>
          <Typography
            sx={{ fontSize: 14, fontWeight: 500, mb: 1, color: '#007AFF', cursor: 'pointer' }}
          >
            Участники
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {participants.slice(0, 2).map((p) => (
              <Avatar
                key={p.id}
                src={p.imageUrl}
                alt={p.firstName}
                sx={{ width: 40, height: 40, mr: 1 }}
              >
                {!p.imageUrl && p.firstName?.[0]}
              </Avatar>
            ))}
            <Typography sx={{ fontSize: 14, ml: 1 }}>{participants.length} человек</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, color: '#007AFF', mb: 1 }}>
            Направить участникам
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Checkbox
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              sx={{
                color: '#006FFD',
                '&.Mui-checked': {
                  color: '#006FFD',
                },
              }}
            />
            <Typography sx={{ fontSize: 14 }}>Оповещение</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            onClick={() => onCancel(notify)}
            variant="outlined"
            sx={{
              height: 48,
              borderRadius: '14px',
              textTransform: 'none',
              fontSize: 16,
              color: '#007AFF',
              borderColor: '#007AFF',
              '&:hover': {
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
                borderColor: '#007AFF',
              },
              '&:active': {
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
                borderColor: '#007AFF',
              },
              fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
            }}
          >
            Всё равно отменить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CancelEventDialog;
