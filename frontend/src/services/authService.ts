import api from './api';
import type {
  LoginCredentials,
  GuestLoginCredentials,
  RegisterUserPayload,
  UpdateProfilePayload,
  UserProfile,
} from '../types/user';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const { data } = await api.post<TokenResponse>('/api/auth/login', credentials);
    return data;
  },

  guestLogin: async (payload: GuestLoginCredentials): Promise<TokenResponse> => {
    const { data } = await api.post<TokenResponse>('/api/auth/guest-login', payload);
    return data;
  },

  register: async (payload: RegisterUserPayload): Promise<UserProfile> => {
    const { data } = await api.post<UserProfile>('/api/auth/register', payload);
    return data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>('/api/users/me');
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const { data } = await api.put<UserProfile>('/api/users/me', payload);
    return data;
  },
};
