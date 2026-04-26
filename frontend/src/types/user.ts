export type UserRole = 'admin' | 'librarian' | 'member' | 'guest';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GuestLoginCredentials {
  name: string;
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'librarian' | 'member';
}

export interface UpdateProfilePayload {
  name: string;
  phone?: string;
  address?: string;
}

export interface UserProfile extends AuthUser {
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}
