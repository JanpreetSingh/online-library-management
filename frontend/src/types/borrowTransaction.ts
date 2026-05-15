export interface BorrowTransaction {
  transaction_id: string;
  book_id: string;
  user_id: string;
  borrowed_at: string;
  due_date: string;
  status: string;
  returned_at?: string;
}

export interface BorrowBookResponse {
  transaction_id: string;
  book_id: string;
  user_id: string;
  borrowed_at: string;
  due_date: string;
  status: string;
}
