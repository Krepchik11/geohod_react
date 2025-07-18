import React, { useEffect, useState } from 'react';
import { api, Event, EventStatus } from '../../api';

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await api.events.getAllEvents({
          statuses: [EventStatus.ACTIVE],
          page: 0,
          size: 10,
        });
        setEvents(response.content);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при загрузке событий');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleRegister = async (eventId: string) => {
    try {
      await api.events.registerForEvent(eventId);
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, participantsCount: (event.participantsCount || 0) + 1 }
            : event
        )
      );
      setRegistrationError(null);
    } catch (err: any) {
      let errorMessage = 'Произошла ошибка при регистрации';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Проверяем, связана ли ошибка с полной группой
      if (
        errorMessage.includes('группа') ||
        errorMessage.includes('полная') ||
        errorMessage.includes('набрана') ||
        errorMessage.includes('максимум')
      ) {
        setRegistrationError('Группа набрана. Регистрация на это событие больше невозможна.');
      } else {
        setRegistrationError(errorMessage);
      }

      // Автоматически скрываем ошибку через 5 секунд
      setTimeout(() => setRegistrationError(null), 5000);
    }
  };

  if (loading) {
    return <div>Загрузка событий...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (events.length === 0) {
    return <div>Нет доступных событий</div>;
  }

  return (
    <div>
      <h2>Список событий</h2>
      {registrationError && (
        <div
          style={{
            color: '#FF3B30',
            backgroundColor: '#FFE5E5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          {registrationError}
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map((event) => (
          <li
            key={event.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              margin: '12px 0',
              padding: '16px',
            }}
          >
            <h3>{event.name}</h3>
            <p>Дата: {new Date(event.date).toLocaleString()}</p>
            <p>Описание: {event.description}</p>
            <p>
              Участники: {event.participantsCount} из {event.maxParticipants}
            </p>
            <p>Статус: {event.status}</p>

            {!event.iamParticipant && (
              <button
                onClick={() => handleRegister(event.id)}
                disabled={event.participantsCount >= event.maxParticipants}
              >
                Записаться
              </button>
            )}

            {event.iamParticipant && <p>Вы записаны на это событие</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
