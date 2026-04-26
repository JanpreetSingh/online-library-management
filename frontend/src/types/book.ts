export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  publication_year?: number;
  total_copies: number;
  available_copies: number;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  publication_year?: number;
  total_copies: number;
  cover_image_url?: string;
}

export type UpdateBookPayload = Partial<CreateBookPayload>;
