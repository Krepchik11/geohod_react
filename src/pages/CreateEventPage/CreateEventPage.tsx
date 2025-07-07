import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EventForm from '../../components/EventForm/EventForm';
import { api } from '../../api';
import SuccessEventDialog from '../../components/SuccessEventDialog/SuccessEventDialog';
import { useUserStore } from '../../store/userStore';

interface EventResponse {
  id: string;
  name: string;
  date: string;
  registrationLink: string;
}

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTitle = location.state?.title || '';
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<EventResponse | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const settings = useUserStore((state) => state.settings);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  const handleSubmit = async (data: { title: string; maxParticipants: number; date: string }) => {
    try {
      const response = await api.events.createEvent({
        name: data.title,
        maxParticipants: data.maxParticipants,
        date: data.date,
      });

      const eventData: EventResponse = {
        id: response.id,
        name: data.title,
        date: data.date,
        registrationLink: `https://t.me/geohodton_bot/app?startapp=registration_${response.id}`,
      };

      setCreatedEvent(eventData);
      setSuccessDialogOpen(true);
    } catch (error: any) {
      console.error('Error creating event:', error);
    }
  };

  const handleCloseDialog = () => {
    setSuccessDialogOpen(false);
    navigate('/events');
  };

  return (
    <>
      <EventForm
        onSubmit={handleSubmit}
        initialTitle={initialTitle}
        initialMaxParticipants={settings?.defaultMaxParticipants ?? 30}
        onInputFocusChange={setIsInputFocused}
      />

      {createdEvent && (
        <SuccessEventDialog
          open={successDialogOpen}
          onClose={handleCloseDialog}
          eventName={createdEvent.name}
          eventDate={formatDate(createdEvent.date)}
          registrationLink={createdEvent.registrationLink}
        />
      )}
    </>
  );
};

export default CreateEventPage;
