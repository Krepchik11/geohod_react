import React from 'react';
import { Box, Slide } from '@mui/material';
import EventNotification from '../EventNotification/EventNotification';

interface NotificationContainerProps {
  open: boolean;
  onClose: () => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ open, onClose }) => {
  const notifications = [
    {
      type: 'registration',
      eventTitle: 'Ландшафтный дизайн',
      timestamp: 'Только что',
    },
    {
      type: 'cancellation',
      eventTitle: 'Прогулка по городу',
      timestamp: '1 день назад',
    },
    {
      type: 'reminder',
      eventTitle: 'Велосипедная прогулка',
      timestamp: '1 день назад',
    },
    {
      type: 'review',
      eventTitle: 'Поход по историческим местам города',
      timestamp: '2 дня назад',
    },
  ];

  return (
    <>
      {open && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1100,
              backgroundColor: 'rgba(14, 24, 30, 0.4)',
            }}
            onClick={onClose}
          />
          <Box
            sx={{
              position: 'fixed',
              top: 30,
              right: 30,
              zIndex: 1300,
            }}
          >
            <Box
              component="img"
              src="/images/close-popup.svg"
              alt="Close"
              onClick={onClose}
              sx={{
                width: 50,
                height: 50,
                cursor: 'pointer',
              }}
            />
          </Box>
        </>
      )}

      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: '#F7F7F7',
            borderTopLeftRadius: '14px',
            borderTopRightRadius: '14px',
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 1200,
            pb: 'calc(56px + env(safe-area-inset-bottom))',
            boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box sx={{ px: 2, pt: 2, pb: 2 }}>
            {notifications.map((notification, index) => (
              <EventNotification
                key={index}
                type={notification.type as any}
                eventTitle={notification.eventTitle}
                timestamp={notification.timestamp}
                onViewClick={onClose}
              />
            ))}
          </Box>
        </Box>
      </Slide>
    </>
  );
};

export default NotificationContainer;
