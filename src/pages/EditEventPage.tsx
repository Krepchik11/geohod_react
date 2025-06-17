import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm/EventForm';
import { api } from '../api';
import TopBar from '../components/TopBar/TopBar';
import BottomNavigation from '../components/BottomNavigation/BottomNavigation';

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      const eventData = await api.events.getEventById(id);
      setEvent(eventData);
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (data: { title: string; maxParticipants: number; date: string }) => {
    if (!id) return;
    await api.events.updateEvent(id, {
      name: data.title,
      maxParticipants: data.maxParticipants,
      date: data.date,
    });
    navigate(`/event/${id}`);
  };

  if (loading || !event) return <div>Загрузка...</div>;

  return (
    <>
      <TopBar title="Редактировать событие" showBackButton />
      <EventForm
        onSubmit={handleSubmit}
        initialTitle={event.name}
        initialDate={event.date}
        initialMaxParticipants={event.maxParticipants}
        submitLabel="Сохранить"
        onInputFocusChange={setIsInputFocused}
      />
      {!isInputFocused && <BottomNavigation />}
    </>
  );
};

export default EditEventPage; 