import axios from 'axios';
// import { Event, EventStatus, EventsResponse, User } from './types'; // Удалено, не используется

export const telegramWebApp = window.Telegram?.WebApp;
export const isTelegramWebApp = Boolean(telegramWebApp);

const API_BASE_URL = '/api/v1';
console.log('Using API URL:', API_BASE_URL);

export const getTelegramUser = () => {
  if (!telegramWebApp?.initDataUnsafe?.user) {
    console.error('Информация о пользователе не доступна');
    return null;
  }
  return telegramWebApp.initDataUnsafe.user;
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: window.Telegram?.WebApp?.initData || '',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API response error:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export const eventsApi = {
  getAllEvents: async (params: any = {}) => {
    try {
      const response = await axiosInstance.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении событий:', error);
      throw error;
    }
  },

  getEventById: async (eventId: string) => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении события ${eventId}:`, error);
      throw error;
    }
  },

  createEvent: async (eventData: any) => {
    try {
      const response = await axiosInstance.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании события:', error);
      throw error;
    }
  },

  updateEvent: async (eventId: string, eventData: any) => {
    try {
      const response = await axiosInstance.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении события ${eventId}:`, error);
      throw error;
    }
  },

  cancelEvent: async (eventId: string) => {
    try {
      const response = await axiosInstance.patch(`/events/${eventId}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при отмене события ${eventId}:`, error);
      throw error;
    }
  },

  finishEvent: async (eventId: string, data: any = {}) => {
    try {
      const response = await axiosInstance.post(`/events/${eventId}/finish`, data);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при завершении события ${eventId}:`, error);
      throw error;
    }
  },

  registerForEvent: async (eventId: string) => {
    try {
      const response = await axiosInstance.post(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при регистрации на событие ${eventId}:`, error);
      throw error;
    }
  },

  unregisterFromEvent: async (eventId: string) => {
    try {
      const response = await axiosInstance.delete(`/events/${eventId}/unregister`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при отмене регистрации на событие ${eventId}:`, error);
      throw error;
    }
  },

  getEventParticipants: async (eventId: string) => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}/participants`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении списка участников события ${eventId}:`, error);
      throw error;
    }
  },
};

export const api = {
  events: eventsApi,
};

export default api;
