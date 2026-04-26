import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookService } from '../services/bookService';
import BookForm, { type BookFormValues } from '../components/BookForm';
import type { Book } from '../types/book';

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    bookService
      .getById(id)
      .then(setBook)
      .catch(() => {
        toast.error('Book not found');
        navigate('/books');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleUpdate = async (values: BookFormValues) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const updated = await bookService.update(id, {
        title: values.title,
        author: values.author,
        isbn: values.isbn,
        category: values.category,
        publisher: values.publisher || undefined,
        publication_year: values.publication_year ? Number(values.publication_year) : undefined,
        total_copies: Number(values.total_copies),
        cover_image_url: values.cover_image_url || undefined,
      });
      toast.success(`"${updated.title}" updated successfully!`);
      navigate('/books');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to update book';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-lg">Online Library</span>
          </div>
          <Link to="/books" className="text-sm text-gray-600 hover:text-blue-600 transition">
            ← Back to Books
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-5">
            <h1 className="text-xl font-bold text-white">Edit Book</h1>
            {book && (
              <p className="text-indigo-200 text-sm mt-0.5">
                Editing: <span className="text-white font-medium">{book.title}</span>
              </p>
            )}
          </div>

          <div className="px-8 py-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              </div>
            ) : book ? (
              <>
                {/* Copy info */}
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-700">
                    Currently <strong>{book.available_copies}</strong> of{' '}
                    <strong>{book.total_copies}</strong> copies available.
                    Changing total copies will proportionally adjust availability.
                  </span>
                </div>

                <BookForm
                  defaultValues={book}
                  onSubmit={handleUpdate}
                  isSubmitting={isSubmitting}
                  submitLabel="Save Changes"
                  onCancel={() => navigate('/books')}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
