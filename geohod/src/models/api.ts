export enum EventStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  FINISHED = 'FINISHED',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  tgUsername: string;
  tgImageUrl: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  maxParticipants: number;
  status: EventStatus;
  author: User;
  participantsCount: number;
  iamParticipant: boolean;
  createdAt: string;
  updatedAt: string;
  registrationLink?: string;
}

export interface EventsRequestParams {
  iamAuthor?: boolean;
  iamParticipant?: boolean;
  statuses?: EventStatus[];
  page?: number;
  size?: number;
}

export interface EventsResponse {
  content: Event[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateEventRequest {
  name: string;
  date: string;
  description: string;
  maxParticipants: number;
}

export interface UpdateEventRequest {
  name: string;
  date: string;
  description: string;
  maxParticipants: number;
}

export interface FinishEventRequest {
  summary: string;
}

export interface SuccessResponse {
  status: 'success';
  id?: string;
}

export interface ParticipantsResponse {
  participants: User[];
}

export interface ApiError {
  status: number;
  message: string;
}
