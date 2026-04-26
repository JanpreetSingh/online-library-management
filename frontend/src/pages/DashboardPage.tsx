import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleBadgeColor: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  librarian: 'bg-indigo-100 text-indigo-700',
  member: 'bg-green-100 text-green-700',
  guest: 'bg-gray-100 text-gray-600',
};

export default function DashboardPage() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-lg">Online Library</span>
          </div>
          <div className="flex items-center gap-3">
            {!hasRole(['guest']) && (
              <Link
                to="/profile"
                className="text-sm text-gray-600 hover:text-blue-600 transition"
              >
                Profile
              </Link>
            )}
            <Link to="/books" className="text-sm text-gray-600 hover:text-blue-600 transition">
              Books
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Welcome card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Welcome back,</p>
              <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
              <span
                className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  roleBadgeColor[user?.role ?? 'guest']
                }`}
              >
                {user?.role}
              </span>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {user?.email && (
            <p className="text-gray-400 text-sm mt-4">{user.email}</p>
          )}
        </div>

        {/* Quick Actions */}
        <h3 className="text-gray-700 font-semibold text-sm uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Browse Books — all roles */}
          <Link
            to="/books"
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-800">Browse Books</p>
            <p className="text-gray-500 text-sm mt-0.5">View the full book catalogue</p>
          </Link>

          {/* Register User — Admin only */}
          {hasRole(['admin']) && (
            <Link
              to="/register"
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-800">Register User</p>
              <p className="text-gray-500 text-sm mt-0.5">Add new librarian or member</p>
            </Link>
          )}

          {/* Profile — non-guest */}
          {!hasRole(['guest']) && (
            <Link
              to="/profile"
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-800">My Profile</p>
              <p className="text-gray-500 text-sm mt-0.5">Update your information</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
