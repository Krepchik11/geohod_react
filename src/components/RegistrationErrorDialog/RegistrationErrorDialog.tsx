import React from 'react';
import { Dialog, DialogContent, Button, Typography, Box, useTheme } from '@mui/material';
import { SentimentDissatisfiedRounded } from '@mui/icons-material';

interface RegistrationErrorDialogProps {
  open: boolean;
  onClose: () => void;
  errorMessage: string;
}

const RegistrationErrorDialog: React.FC<RegistrationErrorDialogProps> = ({
  open,
  onClose,
  errorMessage,
}) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 3, pb: 2, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.error.main,
              borderRadius: '50%',
            }}
          >
            <SentimentDissatisfiedRounded sx={{ color: 'white', fontSize: 30 }} />
          </Box>
        </Box>
        
        <Typography
          sx={{ 
            fontSize: 16, 
            fontWeight: 600, 
            mb: 1, 
            color: theme.palette.text.primary 
          }}
        >
          Регистрация на событие окончена
        </Typography>
        
        <Typography
          sx={{ 
            fontSize: 14, 
            color: theme.palette.text.secondary,
            mb: 3
          }}
        >
          {errorMessage}
        </Typography>
        
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{
            borderRadius: '14px',
            height: 48,
            fontSize: 16,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: theme.palette.primary.main,
            '&:hover': { bgcolor: theme.palette.primary.dark },
          }}
        >
          Понятно
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationErrorDialog; 