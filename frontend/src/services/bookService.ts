import api from './api';
import type { Book, CreateBookPayload, UpdateBookPayload } from '../types/book';

export const bookService = {
  getAll: async (): Promise<Book[]> => {
    const { data } = await api.get<Book[]>('/api/books');
    return data;
  },

  getById: async (id: string): Promise<Book> => {
    const { data } = await api.get<Book>(`/api/books/${id}`);
    return data;
  },

  create: async (payload: CreateBookPayload): Promise<Book> => {
    const { data } = await api.post<Book>('/api/books', payload);
    return data;
  },

  update: async (id: string, payload: UpdateBookPayload): Promise<Book> => {
    const { data } = await api.put<Book>(`/api/books/${id}`, payload);
    return data;
  },
};
