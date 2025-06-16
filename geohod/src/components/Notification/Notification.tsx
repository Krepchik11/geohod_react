import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { Event } from '../../models/Event';

interface NotificationProps {
  event: Event;
  onButtonClick?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ event, onButtonClick }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
        Вы создали мероприятие:
      </Typography>

      <Typography variant="body1" gutterBottom>
        {event.title}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        {event.date}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Организатор: Никола Тесла
      </Typography>

      <Box mt={2}>
        <Button variant="outlined" fullWidth onClick={onButtonClick}>
          Запустить
        </Button>
      </Box>
    </Paper>
  );
};

export default Notification;
