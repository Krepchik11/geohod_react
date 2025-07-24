// Конфигурация для разных окружений
export const environment = {
  // Определяем текущее окружение
  isDevelopment: () => {
    return (
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1') ||
      window.location.hostname.includes('dev') ||
      process.env.NODE_ENV === 'development'
    );
  },

  // Получаем имя бота для текущего окружения
  getBotUsername: () => {
    // Если явно указан в .env — используем его
    if (process.env.VITE_BOT_USERNAME) {
      return process.env.VITE_BOT_USERNAME;
    }
    // По умолчанию всегда geohod_bot
    return 'geohod_bot';
  },

  // Получаем URL API
  getApiUrl: () => {
    return process.env.REACT_APP_API_URL || 'https://app.geohod.ru/api/v1';
  },
};
