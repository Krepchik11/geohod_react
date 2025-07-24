import { environment } from './environment';

// Конфигурация ботов для разных окружений
export const getBotUsername = (): string => {
  const botUsername = environment.getBotUsername();

  console.log('Определение бота:', {
    hostname: window.location.hostname,
    nodeEnv: process.env.NODE_ENV,
    isDev: environment.isDevelopment(),
    botUsername,
  });

  return botUsername;
};

export const getBotUrl = (): string => {
  return `https://t.me/${getBotUsername()}`;
};

export const getRegistrationLink = (eventId: string): string => {
  return `${getBotUrl()}?startapp=registration_${eventId}`;
};
