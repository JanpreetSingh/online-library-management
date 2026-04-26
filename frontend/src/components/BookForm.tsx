import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Book } from '../types/book';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  isbn: z
    .string()
    .min(1, 'ISBN is required')
    .regex(/^[0-9\-X]+$/, 'ISBN can only contain digits, hyphens, and X'),
  category: z.string().min(1, 'Category is required').max(100),
  publisher: z.string().max(255).optional().or(z.literal('')),
  publication_year: z
    .string()
    .optional()
    .refine(
      (v) => !v || (Number(v) >= 1000 && Number(v) <= new Date().getFullYear()),
      { message: `Year must be between 1000 and ${new Date().getFullYear()}` }
    ),
  total_copies: z
    .string()
    .min(1, 'Required')
    .refine((v) => Number(v) >= 1, { message: 'Must be at least 1' }),
  cover_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type BookFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<Book>;
  onSubmit: (values: BookFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}

const BOOK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Children',
  'Self-Help',
  'Business',
  'Philosophy',
  'Art',
  'Travel',
  'Other',
];

export default function BookForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publication_year: '',
      total_copies: '1',
      cover_image_url: '',
    },
  });

  // Pre-fill when editing an existing book
  useEffect(() => {
    if (defaultValues) {
      reset({
        title: defaultValues.title ?? '',
        author: defaultValues.author ?? '',
        isbn: defaultValues.isbn ?? '',
        category: defaultValues.category ?? '',
        publisher: defaultValues.publisher ?? '',
        publication_year: defaultValues.publication_year?.toString() ?? '',
        total_copies: defaultValues.total_copies?.toString() ?? '1',
        cover_image_url: defaultValues.cover_image_url ?? '',
      });
    }
  }, [defaultValues, reset]);

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
      hasError ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Row 1: Title + Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="The Great Gatsby"
            className={inputClass(!!errors.title)}
            {...register('title')}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Author <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="F. Scott Fitzgerald"
            className={inputClass(!!errors.author)}
            {...register('author')}
          />
          {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
        </div>
      </div>

      {/* Row 2: ISBN + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            ISBN <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="978-3-16-148410-0"
            className={inputClass(!!errors.isbn)}
            {...register('isbn')}
          />
          {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className={inputClass(!!errors.category) + ' bg-white'}
            {...register('category')}
          >
            <option value="">— Select category —</option>
            {BOOK_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>
      </div>

      {/* Row 3: Publisher + Year + Copies */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Publisher</label>
          <input
            type="text"
            placeholder="Scribner"
            className={inputClass(!!errors.publisher)}
            {...register('publisher')}
          />
          {errors.publisher && <p className="text-red-500 text-xs mt-1">{errors.publisher.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Publication Year</label>
          <input
            type="number"
            placeholder="1925"
            min={1000}
            max={new Date().getFullYear()}
            className={inputClass(!!errors.publication_year)}
            {...register('publication_year')}
          />
          {errors.publication_year && (
            <p className="text-red-500 text-xs mt-1">{errors.publication_year.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            No. of Copies <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            className={inputClass(!!errors.total_copies)}
            {...register('total_copies')}
          />
          {errors.total_copies && (
            <p className="text-red-500 text-xs mt-1">{errors.total_copies.message}</p>
          )}
        </div>
      </div>

      {/* Row 4: Cover Image URL */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Cover Image URL <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="url"
          placeholder="https://example.com/cover.jpg"
          className={inputClass(!!errors.cover_image_url)}
          {...register('cover_image_url')}
        />
        {errors.cover_image_url && (
          <p className="text-red-500 text-xs mt-1">{errors.cover_image_url.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
