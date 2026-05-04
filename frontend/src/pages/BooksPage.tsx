import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { bookService } from '../services/bookService';
import { borrowService } from '../services/borrowService';
import BookForm, { type BookFormValues } from '../components/BookForm';
import type { Book } from '../types/book';

export default function BooksPage() {
  const { hasRole, user } = useAuth();
  const navigate = useNavigate();
  const canManage = hasRole(['admin', 'librarian']);
  const canBorrow = hasRole(['admin', 'librarian', 'member']);

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [borrowingBookId, setBorrowingBookId] = useState<string | null>(null);

  // Load books on mount
  useEffect(() => {
    bookService
      .getAll()
      .then(setBooks)
      .catch(() => toast.error('Could not load books'))
      .finally(() => setIsLoading(false));
  }, []);

  // Client-side search filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }, [books, search]);

  const handleAddBook = async (values: BookFormValues) => {
    setIsSubmitting(true);
    try {
      const created = await bookService.create({
        title: values.title,
        author: values.author,
        isbn: values.isbn,
        category: values.category,
        publisher: values.publisher || undefined,
        publication_year: values.publication_year ? Number(values.publication_year) : undefined,
        total_copies: Number(values.total_copies),
        cover_image_url: values.cover_image_url || undefined,
      });
      setBooks((prev) => [created, ...prev]);
      setShowAddModal(false);
      toast.success(`"${created.title}" added to the library!`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to add book';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBorrowBook = async (bookId: string, bookTitle: string) => {
    setBorrowingBookId(bookId);
    try {
      const response = await borrowService.borrowBook(bookId);
      
      // Update the book's available copies in the local state
      setBooks((prev) =>
        prev.map((book) =>
          book.id === bookId
            ? { ...book, available_copies: book.available_copies - 1 }
            : book
        )
      );

      // Format due date
      const dueDate = new Date(response.due_date).toLocaleDateString();
      toast.success(`Successfully borrowed "${bookTitle}"! Due date: ${dueDate}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to borrow book';
      toast.error(msg);
    } finally {
      setBorrowingBookId(null);
    }
  };

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
            {!hasRole(['guest']) && (
              <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Profile
              </Link>
            )}
            <span className="text-xs text-gray-400 capitalize">{user?.name} ({user?.role})</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book Catalogue</h1>
            <p className="text-gray-500 text-sm mt-0.5">{books.length} books in the library</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Book
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, author, ISBN, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 font-medium">
                {search ? `No books match "${search}"` : 'No books in the library yet'}
              </p>
              {canManage && !search && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Add the first book
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Cover</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Author</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">ISBN</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Copies</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Available</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        {book.cover_image_url ? (
                          <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="w-10 h-12 object-cover rounded shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">
                        {book.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{book.author}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{book.isbn}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{book.total_copies}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                            book.available_copies > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {book.available_copies > 0 ? `${book.available_copies} available` : 'All borrowed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canBorrow && book.available_copies > 0 && (
                            <button
                              onClick={() => handleBorrowBook(book.id, book.title)}
                              disabled={borrowingBookId === book.id}
                              className="text-xs text-green-600 hover:text-green-800 font-medium border border-green-200 hover:border-green-400 px-3 py-1 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {borrowingBookId === book.id ? 'Borrowing...' : 'Borrow'}
                            </button>
                          )}
                          {canManage && (
                            <button
                              onClick={() => navigate(`/books/${book.id}/edit`)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 hover:border-blue-400 px-3 py-1 rounded-lg transition"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isSubmitting && setShowAddModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">Add New Book</h2>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <BookForm
                onSubmit={handleAddBook}
                isSubmitting={isSubmitting}
                submitLabel="Add Book"
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
