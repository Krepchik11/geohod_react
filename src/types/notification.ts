export interface NotificationPayload {
  eventId?: string;
  eventName?: string;
  reason?: string;
  participantName?: string;
  reviewerName?: string;
  rating?: number;
  reviewText?: string;
  authorId?: string;
}

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  payload: string; // JSON string
  isRead: boolean;
  createdAt: string;
  eventId: string | null; // Новое поле от бэкенда
}

export type NotificationType =
  | 'EVENT_CREATED'
  | 'EVENT_CANCELLED'
  | 'PARTICIPANT_REGISTERED'
  | 'PARTICIPANT_UNREGISTERED'
  | 'EVENT_FINISHED';

export interface NotificationResponse {
  result: string;
  message: string;
  data: Notification[];
}
