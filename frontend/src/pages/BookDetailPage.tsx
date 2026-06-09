import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { bookService } from '../services/bookService';
import { borrowService } from '../services/borrowService';
import type { Book } from '../types/book';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasRole, user } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const canBorrow = hasRole(['member']);
  const canManage = hasRole(['admin', 'librarian']);

  useEffect(() => {
    if (!id) {
      navigate('/books');
      return;
    }

    bookService
      .getById(id)
      .then(setBook)
      .catch(() => {
        toast.error('Book not found');
        navigate('/books');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleBorrow = async () => {
    if (!book || !id) return;

    setIsBorrowing(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await borrowService.borrowBook(id);

      // Update available copies
      setBook((prev) => prev ? { ...prev, available_copies: prev.available_copies - 1 } : null);

      const dueDate = new Date(response.due_date).toLocaleDateString();
      const msg = `Successfully borrowed "${book.title}"! Due date: ${dueDate}`;
      setSuccessMessage(msg);
      toast.success(msg);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to borrow book';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsBorrowing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-lg">Online Library</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition">
              Dashboard
            </Link>
            <Link to="/books" className="text-sm text-gray-600 hover:text-blue-600 transition">
              Books
            </Link>
            {!hasRole(['guest']) && (
              <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Profile
              </Link>
            )}
            <span className="text-xs text-gray-400 capitalize">{user?.name} ({user?.role})</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Books
        </Link>

        {/* Book Detail Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-48 h-64 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-48 h-64 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg shadow-md flex items-center justify-center">
                    <svg className="w-20 h-20 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-lg text-gray-600 mb-4">by {book.author}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">ISBN:</span>
                    <span className="text-sm text-gray-700 font-mono">{book.isbn}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                      {book.category}
                    </span>
                  </div>
                  {book.publisher && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Publisher:</span>
                      <span className="text-sm text-gray-700">{book.publisher}</span>
                    </div>
                  )}
                  {book.publication_year && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Published:</span>
                      <span className="text-sm text-gray-700">{book.publication_year}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Total Copies:</span>
                    <span className="text-sm text-gray-700">{book.total_copies}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Available:</span>
                    <span
                      className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                        book.available_copies > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {book.available_copies > 0 ? `${book.available_copies} available` : 'All borrowed'}
                    </span>
                  </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div
                    data-testid="success-message"
                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
                  >
                    {successMessage}
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div
                    data-testid="error-message"
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {canBorrow && book.available_copies > 0 && (
                    <button
                      data-testid="borrow-button"
                      onClick={handleBorrow}
                      disabled={isBorrowing}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:cursor-not-allowed"
                    >
                      {isBorrowing ? 'Borrowing...' : 'Borrow Book'}
                    </button>
                  )}
                  {canBorrow && book.available_copies === 0 && (
                    <button
                      data-testid="borrow-button"
                      disabled
                      className="bg-gray-300 text-gray-500 font-semibold px-6 py-2.5 rounded-lg cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                  {canManage && (
                    <button
                      onClick={() => navigate(`/books/${book.id}/edit`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
                    >
                      Edit Book
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
