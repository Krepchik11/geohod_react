import { create } from 'zustand';
import { telegramWebApp, usersApi } from '../api/telegramApi';
import { WebApp } from '@twa-dev/types';

interface UserWithUuid {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  uuid: string;
}

interface UserState {
  user: UserWithUuid | null;
  isLoading: boolean;
  error: string | null;
  initUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  initUser: async () => {
    set({ isLoading: true });
    try {
      const userData = telegramWebApp?.initDataUnsafe?.user;

      if (!userData) {
        console.error('No user data available');
        set({ error: 'Не удалось получить данные пользователя Telegram' });
        return;
      }
      const backendUser = await usersApi.getUserByTelegramId(userData.id);
      console.log('backendUser:', backendUser);
      set({ user: { ...userData, uuid: backendUser.data.id }, error: null });
    } catch (error) {
      console.error('Error in initUser:', error);
      set({ error: 'Ошибка при получении данных пользователя' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
