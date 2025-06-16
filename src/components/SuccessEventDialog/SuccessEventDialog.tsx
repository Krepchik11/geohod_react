import React, { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Toast from '../Toast/Toast';

interface SuccessEventDialogProps {
  open: boolean;
  onClose: () => void;
  eventName: string;
  eventDate: string;
  registrationLink: string;
}

const SuccessEventDialog: React.FC<SuccessEventDialogProps> = ({
  open,
  onClose,
  eventName,
  eventDate,
  registrationLink,
}) => {
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      setShowCopyNotification(true);
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const tempInput = document.createElement('input');
      tempInput.value = registrationLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      setShowCopyNotification(true);
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 2000);
    }
  };

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
            borderRadius: '14px',
            margin: '16px',
            position: 'relative',
          },
        }}
      >
        <DialogContent sx={{ p: 3, pb: 2 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 400,
              mb: '23px',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            Вы успешно создали событие
          </Typography>

          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 500,
              mb: '6px',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            {eventName}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TodayIcon sx={{ fontSize: 20, color: '#8E8E93' }} />
            <Typography
              sx={{
                fontSize: 15,
                color: '#8E8E93',
              }}
            >
              {eventDate}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 500,
                color: '#000',
                fontFamily: 'Roboto, sans-serif',
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <LinkIcon
                sx={{
                  fontSize: 20,
                  color: '#000000',
                  transform: 'rotate(-45deg)',
                  fontWeight: 500,
                }}
              />
              Копировать ссылку
            </Typography>
            <Box
              onClick={handleCopyLink}
              sx={{
                cursor: 'pointer',
                p: 1,
                borderRadius: '8px',
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: '#007AFF',
                  fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
                  wordBreak: 'break-all',
                }}
              >
                {registrationLink}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            onClick={onClose}
            variant="outlined"
            sx={{
              height: 48,
              borderRadius: '14px',
              textTransform: 'none',
              fontSize: 17,
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
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        message="Ссылка скопирована в буфер обмена"
        isVisible={showCopyNotification}
        type="success"
        icon={
          <Box
            sx={{
              background: '#2EBC65',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LinkIcon
              sx={{
                color: '#fff',
                fontSize: 18,
                transform: 'rotate(-45deg)',
              }}
            />
          </Box>
        }
      />
    </>
  );
};

export default SuccessEventDialog;
