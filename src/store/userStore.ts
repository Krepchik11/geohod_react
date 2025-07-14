import { create } from 'zustand';
import { telegramWebApp, usersApi, userSettingsApi } from '../api/telegramApi';
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

interface UserSettings {
  defaultDonationAmount: string;
  defaultMaxParticipants: number;
}

interface UserState {
  user: UserWithUuid | null;
  isLoading: boolean;
  error: string | null;
  initUser: () => void;
  settings: UserSettings | null;
  setSettings: (settings: UserSettings) => void;
  fetchSettings: () => Promise<void>;
  hasUnreadNotifications: boolean;
  setHasUnreadNotifications: (hasUnread: boolean) => void;
  fetchHasUnreadNotifications: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  settings: null,
  hasUnreadNotifications: false,
  setHasUnreadNotifications: (hasUnread) => set({ hasUnreadNotifications: hasUnread }),
  fetchHasUnreadNotifications: async () => {
    try {
      const res = await import('../api/telegramApi').then((m) =>
        m.api.notifications.getNotifications({ limit: 1, isRead: false })
      );
      set({ hasUnreadNotifications: Array.isArray(res.data) && res.data.length > 0 });
    } catch {
      set({ hasUnreadNotifications: false });
    }
  },
  setSettings: (settings) => set({ settings }),
  fetchSettings: async () => {
    const res = await userSettingsApi.getSettings();
    set({ settings: res.data });
  },
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
      set({ user: { ...userData, uuid: backendUser.data.id }, error: null });
    } catch (error) {
      console.error('Error in initUser:', error);
      set({ error: 'Ошибка при получении данных пользователя' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
