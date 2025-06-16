import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { telegramWebApp } from '../api/telegramApi';

export const useTelegramBackButton = (isVisible: boolean = true) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!telegramWebApp?.BackButton) {
      console.warn('Telegram.WebApp.BackButton is not available');
      return;
    }

    const handleClick = () => {
      navigate(-1);
    };

    if (isVisible) {
      telegramWebApp.BackButton.show();
      telegramWebApp.BackButton.onClick(handleClick);
    } else {
      telegramWebApp.BackButton.hide();
    }

    return () => {
      if (telegramWebApp?.BackButton) {
        telegramWebApp.BackButton.offClick(handleClick);
        telegramWebApp.BackButton.hide();
      }
    };
  }, [isVisible, navigate]);
};
