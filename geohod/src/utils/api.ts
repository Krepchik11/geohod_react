import { ApiError } from '../models/api';

const API_BASE_URL = '/api/v1';

export const getTelegramToken = (): string => {
  return localStorage.getItem('telegram_token') || '';
};

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export const fetchApi = async <T>(
  endpoint: string,
  options: RequestOptions,
  params?: Record<string, any>
): Promise<T> => {
  const url = new URL(`${window.location.origin}${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, item));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }

  const token = getTelegramToken();

  const fetchOptions: RequestInit = {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...options.headers,
    },
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      const errorData = await response.json();
      throw {
        status: response.status,
        message: errorData.message || `Ошибка при запросе: ${response.statusText}`,
      } as ApiError;
    }

    if (response.status === 204) {
      return { status: 'success' } as unknown as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 500,
      message: `Произошла ошибка: ${(error as Error).message}`,
    } as ApiError;
  }
};
