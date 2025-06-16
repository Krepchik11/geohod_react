interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebAppInitDataUnsafe {
  query_id?: string;
  user?: TelegramUser;
  auth_date?: string;
  hash?: string;
  start_param?: string;
}

interface TelegramWebAppBackButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

interface TelegramWebAppMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  setText: (text: string) => void;
  setParams: (params: {
    text?: string;
    color?: string;
    textColor?: string;
    isActive?: boolean;
    isVisible?: boolean;
  }) => void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: TelegramWebAppMainButton;
  BackButton: TelegramWebAppBackButton;
  close: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, callback: Function) => void;
  offEvent: (eventType: string, callback: Function) => void;
  ready: () => void;
  showPopup: (params: any, callback?: Function) => void;
  showAlert: (message: string, callback?: Function) => void;
  showConfirm: (message: string, callback?: Function) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: Function) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  setBackgroundColor: (color: string) => void;
  setHeaderColor: (color_key: 'bg_color' | 'secondary_bg_color') => void;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
  hideLoadingScreen?: () => void;
}
