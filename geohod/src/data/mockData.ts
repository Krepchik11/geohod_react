import { Chat, Event, Message, User, CATEGORIES, CURRENT_USER } from '../models/Event';

export const USERS: User[] = [
  {
    id: 'user1',
    name: 'Владимир Петрович',
    avatar: '/assets/avatars/user1.jpg',
  },
  {
    id: 'user2',
    name: 'Николай Тесла',
    avatar: '/assets/avatars/user2.jpg',
  },
  {
    id: 'user3',
    name: 'Анна Ивановна',
    avatar: '/assets/avatars/user3.jpg',
  },
  {
    id: 'user4',
    name: 'Михаил Ломоносов',
    avatar: '/assets/avatars/user4.jpg',
  },
  CURRENT_USER,
];

export { CURRENT_USER };

export const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Ландшафтный дизайн',
    date: '10.07.2025',
    category: CATEGORIES[0],
    maxParticipants: 15,
    currentParticipants: 8,
    tags: ['Дизайн', 'Природа', 'Нови Сад'],
    organizer: USERS[1],
  },
  {
    id: '2',
    title: 'Поход в музей',
    date: '10.05.2023',
    category: CATEGORIES[1],
    maxParticipants: 20,
    currentParticipants: 12,
    tags: ['Музей', 'Искусство', 'Нови Сад'],
    organizer: USERS[2],
  },
  {
    id: '3',
    title: 'Поход на Фрушка Гора',
    date: '05.05.2024',
    category: CATEGORIES[2],
    maxParticipants: 10,
    currentParticipants: 5,
    tags: ['Гора', 'Природа', 'Нови Сад'],
    organizer: USERS[3],
  },
];

export const MESSAGES: { [key: string]: Message[] } = {
  chat1: [
    {
      id: 'm1',
      text: 'Привет, как дела?',
      sender: USERS[1],
      timestamp: '2025-07-09T14:30:00',
      isRead: true,
    },
    {
      id: 'm2',
      text: 'Привет! Всё хорошо, готовлюсь к мероприятию',
      sender: CURRENT_USER,
      timestamp: '2025-07-09T14:32:00',
      isRead: true,
    },
    {
      id: 'm3',
      text: 'Отлично! Что насчет нашего мероприятия по ландшафтному дизайну? Всё идет по плану?',
      sender: USERS[1],
      timestamp: '2025-07-09T14:33:00',
      isRead: true,
    },
    {
      id: 'm4',
      text: 'Да, все идёт отлично. Уже 8 человек зарегистрировались.',
      sender: CURRENT_USER,
      timestamp: '2025-07-09T14:35:00',
      isRead: true,
    },
  ],
  chat2: [
    {
      id: 'm5',
      text: 'Добрый день! Я организую поход в музей, хотели бы присоединиться?',
      sender: USERS[2],
      timestamp: '2025-07-08T10:10:00',
      isRead: true,
    },
    {
      id: 'm6',
      text: 'Здравствуйте! Звучит интересно. Когда планируется мероприятие?',
      sender: CURRENT_USER,
      timestamp: '2025-07-08T10:15:00',
      isRead: true,
    },
    {
      id: 'm7',
      text: '10 мая 2023 года. Мы посетим новую выставку современного искусства.',
      sender: USERS[2],
      timestamp: '2025-07-08T10:20:00',
      isRead: false,
    },
  ],
  chat3: [
    {
      id: 'm8',
      text: 'Привет! Ты записался на поход на Фрушка Гора?',
      sender: USERS[3],
      timestamp: '2025-07-07T16:45:00',
      isRead: true,
    },
    {
      id: 'm9',
      text: 'Привет! Да, я в списке участников.',
      sender: CURRENT_USER,
      timestamp: '2025-07-07T16:50:00',
      isRead: true,
    },
    {
      id: 'm10',
      text: 'Отлично! Не забудь взять с собой воду и удобную обувь.',
      sender: USERS[3],
      timestamp: '2025-07-07T16:55:00',
      isRead: true,
    },
    {
      id: 'm11',
      text: 'Мы выходим рано утром, встречаемся в 7:00 у центрального входа в парк.',
      sender: USERS[3],
      timestamp: '2025-07-07T17:00:00',
      isRead: false,
    },
  ],
};

export const CHATS: Chat[] = [
  {
    id: 'chat1',
    participants: [CURRENT_USER, USERS[1]],
    lastMessage: MESSAGES['chat1'][MESSAGES['chat1'].length - 1],
    event: EVENTS[0],
    unreadCount: 0,
  },
  {
    id: 'chat2',
    participants: [CURRENT_USER, USERS[2]],
    lastMessage: MESSAGES['chat2'][MESSAGES['chat2'].length - 1],
    event: EVENTS[1],
    unreadCount: 1,
  },
  {
    id: 'chat3',
    participants: [CURRENT_USER, USERS[3]],
    lastMessage: MESSAGES['chat3'][MESSAGES['chat3'].length - 1],
    event: EVENTS[2],
    unreadCount: 1,
  },
];
