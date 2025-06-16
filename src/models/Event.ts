export interface Category {
  id: string;
  name: string;
  color: string;
  shortName: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  category: Category;
  maxParticipants?: number;
  currentParticipants?: number;
  tags?: string[];
  organizer: User;
}

export interface Message {
  id: string;
  text: string;
  sender: User;
  timestamp: string;
  isRead: boolean;
  event?: Event;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  event?: Event;
  unreadCount?: number;
}

export const CATEGORIES: Category[] = [
  {
    id: 'design',
    name: 'Дизайн',
    color: '#3f51b5',
    shortName: 'ЛД',
  },
  {
    id: 'museum',
    name: 'Музей',
    color: '#f44336',
    shortName: 'М',
  },
  {
    id: 'tourism',
    name: 'Туризм',
    color: '#4caf50',
    shortName: 'Т',
  },
  {
    id: 'history',
    name: 'История',
    color: '#ff9800',
    shortName: 'И',
  },
];

export const CURRENT_USER: User = {
  id: 'current',
  name: 'Владимир Петрович',
  avatar: '/assets/avatars/user.jpg',
};
