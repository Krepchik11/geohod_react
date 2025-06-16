import telegramApi, { eventsApi } from './telegramApi';

export const api = {
  events: eventsApi,
};

export * from '../models/api';
export * from './telegramApi';
