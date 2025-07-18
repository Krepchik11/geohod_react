import React, { useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ruRU } from '@mui/material/locale';
import { telegramWebApp, isTelegramWebApp } from '../../api/telegramApi';

const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        * {
          font-family: Roboto, sans-serif;
        }
      `,
    },
  },
});

interface TelegramThemeProviderProps {
  children: React.ReactNode;
}

const TelegramThemeProvider: React.FC<TelegramThemeProviderProps> = ({ children }) => {
  const telegramTheme = telegramWebApp?.themeParams || {};
  const colorScheme = telegramWebApp?.colorScheme || 'light';

  const theme = useMemo(() => {
    const defaultLightTheme = {
      bg_color: '#f5f5f5',
      secondary_bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#757575',
      link_color: '#2196f3',
      button_color: '#2196f3',
      button_text_color: '#ffffff',
    };

    const defaultDarkTheme = {
      bg_color: '#1f1f1f',
      secondary_bg_color: '#303030',
      text_color: '#ffffff',
      hint_color: '#aaaaaa',
      link_color: '#4dabf5',
      button_color: '#2196f3',
      button_text_color: '#ffffff',
    };

    const defaultTheme = colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;

    const themeParams = {
      ...defaultTheme,
      ...telegramTheme,
    };

    return createTheme(
      {
        palette: {
          mode: colorScheme as 'light' | 'dark',
          primary: {
            main: '#007AFF',
            dark: '#0056b3',
          },
          secondary: {
            main: themeParams.link_color,
          },
          success: {
            main: '#2EBC65',
          },
          error: {
            main: '#FF3B30',
          },
          background: {
            default: themeParams.bg_color,
            paper: themeParams.secondary_bg_color,
          },
          text: {
            primary: themeParams.text_color,
            secondary: themeParams.hint_color,
          },
        },
        typography: {
          fontFamily: 'Roboto, sans-serif',
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                color: themeParams.button_text_color,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiCssBaseline: {
            styleOverrides: `
              * {
                font-family: Roboto, sans-serif;
              }
              body {
                height: 'auto';
                min-height: '100vh';
                width: '100%';
              }
              #root {
                height: 'auto';
                min-height: '100vh';
                overflow: 'visible';
              }
            `,
          },
        },
      },
      ruRU
    );
  }, [telegramTheme, colorScheme]);

  useEffect(() => {
    if (isTelegramWebApp && telegramWebApp) {
      try {
        const bgColor = telegramTheme.bg_color || (colorScheme === 'dark' ? '#1f1f1f' : '#f5f5f5');
        telegramWebApp.setBackgroundColor(bgColor);

        const headerColor = colorScheme === 'dark' ? 'secondary_bg_color' : 'bg_color';
        telegramWebApp.setHeaderColor(headerColor);

        telegramWebApp.enableClosingConfirmation();

        telegramWebApp.ready();
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    }

    if (window.hideLoadingScreen) {
      setTimeout(() => window.hideLoadingScreen(), 500);
    }
  }, [telegramTheme, colorScheme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default TelegramThemeProvider;
