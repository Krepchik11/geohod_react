import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import { Today as TodayIcon, Link as LinkIcon } from '@mui/icons-material';
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
  const theme = useTheme();
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
            padding: '0px',
            position: 'relative',
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <DialogContent sx={{ p: 3, pb: 2 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 400,
              mb: '15px',
              fontFamily: 'Roboto, sans-serif',
              color: theme.palette.text.primary,
            }}
          >
            Вы успешно создали событие
          </Typography>

          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 400,
              mb: '6px',
              fontFamily: 'Roboto, sans-serif',
              color: theme.palette.text.primary,
            }}
          >
            {eventName}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TodayIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
            <Typography
              sx={{
                fontSize: 14,
                color: theme.palette.text.secondary,
              }}
            >
              {eventDate}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                color: theme.palette.text.primary,
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
                  color: theme.palette.text.primary,
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
                  color: theme.palette.primary.main,
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
              fontSize: 16,
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderColor: theme.palette.primary.main,
              },
              '&:active': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderColor: theme.palette.primary.main,
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
                fontSize: 17,
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
