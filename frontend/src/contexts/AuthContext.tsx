import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthUser, UserRole } from '../types/user';

interface JwtPayload {
  sub: string;      // user id
  name: string;
  email?: string;
  role: UserRole;
  exp: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodeAndSetUser = useCallback((rawToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(rawToken);
      // Check expiry
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('access_token');
        return;
      }
      setToken(rawToken);
      setUser({
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      });
    } catch {
      localStorage.removeItem('access_token');
    }
  }, []);

  // Restore token on mount
  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (stored) {
      decodeAndSetUser(stored);
    }
    setIsLoading(false);
  }, [decodeAndSetUser]);

  const login = useCallback((rawToken: string) => {
    localStorage.setItem('access_token', rawToken);
    decodeAndSetUser(rawToken);
  }, [decodeAndSetUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles: UserRole[]) => !!user && roles.includes(user.role),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
