import { create } from 'zustand';
import { api } from '../api/telegramApi';

interface Event {
  id: string;
  name: string;
  date: string;
  description: string | null;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  author: {
    id: string;
    username: string;
    name: string;
    imageUrl: string;
    rating?: number;
  };
}

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  getEventById: (id: string) => Event | null;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.events.getAllEvents();
      if (response && response.content) {
        set({ events: response.content, loading: false });
      }
    } catch (error) {
      console.error('Ошибка при загрузке событий:', error);
      set({ error: 'Не удалось загрузить события', loading: false });
    }
  },

  getEventById: (id: string) => {
    const { events } = get();
    return events.find((event) => event.id === id) || null;
  },
}));
