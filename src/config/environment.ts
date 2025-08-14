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

  getBotUsername: () => {
    if (process.env.REACT_APP_BOT_USERNAME) {
      return process.env.REACT_APP_BOT_USERNAME;
    }

    return 'geohodton_bot';
  },
};
