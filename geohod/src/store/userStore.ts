import { create } from 'zustand';
import { telegramWebApp } from '../api/telegramApi';
import { WebApp } from '@twa-dev/types';

interface UserState {
  user: WebApp['initDataUnsafe']['user'] | null;
  isLoading: boolean;
  error: string | null;
  initUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  initUser: () => {
    set({ isLoading: true });
    try {
      const userData = telegramWebApp?.initDataUnsafe?.user;

      if (!userData) {
        console.error('No user data available');
        set({ error: 'Не удалось получить данные пользователя Telegram' });
        return;
      }
      set({ user: userData, error: null });
    } catch (error) {
      console.error('Error in initUser:', error);
      set({ error: 'Ошибка при получении данных пользователя' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
