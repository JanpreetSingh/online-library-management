import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  phone: z
    .string()
    .max(30, 'Phone too long')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address too long')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, login } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', address: '' },
  });

  // Load current profile from API and pre-fill form
  useEffect(() => {
    authService.getProfile().then((profile) => {
      reset({
        name: profile.name ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
      });
    }).catch(() => {
      toast.error('Could not load profile');
    });
  }, [reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await authService.updateProfile({
        name: values.name,
        phone: values.phone || undefined,
        address: values.address || undefined,
      });
      // Refresh token is not reissued on profile update — just show success
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Failed to update profile';
      toast.error(msg);
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
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-blue-100 text-sm capitalize">{user?.role}</p>
                {user?.email && (
                  <p className="text-blue-200 text-xs mt-0.5">{user.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Edit Profile</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email — read-only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-gray-400 text-xs">(cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={user?.email ?? '—'}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 000 0000"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.phone ? 'border-red-400' : 'border-gray-300'
                  }`}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  autoComplete="street-address"
                  placeholder="123 Main St, City, Country"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${
                    errors.address ? 'border-red-400' : 'border-gray-300'
                  }`}
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-6 py-2.5 rounded-lg transition"
                >
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-500 hover:text-gray-800 transition"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
