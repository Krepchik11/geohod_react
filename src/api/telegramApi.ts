import axios from 'axios';

export const telegramWebApp = window.Telegram?.WebApp;
export const isTelegramWebApp = Boolean(telegramWebApp);

export const getTelegramUser = () => {
  if (!telegramWebApp?.initDataUnsafe?.user) {
    console.error('Информация о пользователе не доступна');
    return null;
  }
  return telegramWebApp.initDataUnsafe.user;
};

const axiosV1 = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: window.Telegram?.WebApp?.initData || '',
  },
  withCredentials: true,
});

const axiosV2 = axios.create({
  baseURL: '/api/v2',
  headers: {
    'Content-Type': 'application/json',
    Authorization: window.Telegram?.WebApp?.initData || '',
  },
  withCredentials: true,
});

axiosV2.interceptors.request.use((config) => {
  return config;
});

axiosV2.interceptors.response.use(
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

export const usersApi = {
  getUserByTelegramId: async (telegramId: string | number) => {
    const response = await axiosV2.get(`/users/by-tg-id/${telegramId}`);
    return response.data;
  },
};

export const eventsApi = {
  getAllEvents: async (params: any = {}) => {
    try {
      const response = await axiosV1.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении событий:', error);
      throw error;
    }
  },

  getEventById: async (eventId: string) => {
    try {
      const response = await axiosV1.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении события ${eventId}:`, error);
      throw error;
    }
  },

  createEvent: async (eventData: any) => {
    try {
      const response = await axiosV1.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании события:', error);
      throw error;
    }
  },

  updateEvent: async (eventId: string, eventData: any) => {
    try {
      const response = await axiosV1.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении события ${eventId}:`, error);
      throw error;
    }
  },

  cancelEvent: async (eventId: string) => {
    try {
      const response = await axiosV1.patch(`/events/${eventId}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при отмене события ${eventId}:`, error);
      throw error;
    }
  },

  finishEvent: async (eventId: string, data: any = {}) => {
    try {
      const response = await axiosV1.patch(`/events/${eventId}/finish`, data);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при завершении события ${eventId}:`, error);
      throw error;
    }
  },

  registerForEvent: async (eventId: string) => {
    try {
      const response = await axiosV1.post(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при регистрации на событие ${eventId}:`, error);
      throw error;
    }
  },

  unregisterFromEvent: async (eventId: string) => {
    try {
      const response = await axiosV1.delete(`/events/${eventId}/unregister`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при отмене регистрации на событие ${eventId}:`, error);
      throw error;
    }
  },

  getEventParticipants: async (eventId: string) => {
    try {
      const response = await axiosV1.get(`/events/${eventId}/participants`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении списка участников события ${eventId}:`, error);
      throw error;
    }
  },
};

export const reviewsApi = {
  getUserReviews: async (userId: string, page: number = 0, size: number = 10) => {
    const response = await axiosV2.get(`/users/${userId}/reviews`, {
      params: { page, size },
    });
    return response.data;
  },
  getUserRating: async (userId: string) => {
    const response = await axiosV2.get(`/users/${userId}/rating`);
    return response.data;
  },
  hideReview: async (reviewId: string) => {
    const response = await axiosV2.post(`/reviews/${reviewId}/hide`);
    return response.data;
  },
  unhideReview: async (reviewId: string) => {
    const response = await axiosV1.post(`/reviews/${reviewId}/unhide`);
    return response.data;
  },
  postReview: async (data: { userId: string; rating: number; text: string }) => {
    const response = await axiosV2.post(`/reviews`, data);
    return response.data;
  },
};

export const userSettingsApi = {
  getSettings: async () => {
    const response = await axiosV2.get('/user/settings');
    return response.data;
  },
  updateSettings: async (data: {
    defaultDonationAmount: string;
    defaultMaxParticipants: number;
  }) => {
    const response = await axiosV2.put('/user/settings', data);
    return response.data;
  },
};

export const api = {
  events: eventsApi,
  reviews: reviewsApi,
  users: usersApi,
  userSettings: userSettingsApi,
};

export default api;
