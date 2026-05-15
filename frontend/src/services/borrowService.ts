import api from './api';
import type { BorrowBookResponse } from '../types/borrowTransaction';

export const borrowService = {
  borrowBook: async (bookId: string): Promise<BorrowBookResponse> => {
    const { data } = await api.post<BorrowBookResponse>(`/api/borrow/${bookId}`);
    return data;
  },
};
