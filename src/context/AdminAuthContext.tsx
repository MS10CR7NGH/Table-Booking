import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { buildApiUrl } from '../utils/api/config';

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AdminAuthContextValue {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (options?: { silent?: boolean }) => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'aura_admin_token';
const USER_KEY = 'aura_admin_user';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (admin) {
      localStorage.setItem(USER_KEY, JSON.stringify(admin));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [admin]);

  const login = async (email: string, password: string) => {
    const response = await fetch(buildApiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Đăng nhập thất bại');
    }

    const data = await response.json();
    setToken(data.token);
    setAdmin(data.user);
    toast.success('Đăng nhập thành công');
  };

  const logout = (options?: { silent?: boolean }) => {
    setToken(null);
    setAdmin(null);
    if (!options?.silent) {
      toast.success('Đã đăng xuất khỏi khu vực quản trị');
    }
  };

  const value = useMemo<AdminAuthContextValue>(() => ({
    token,
    admin,
    isAuthenticated: Boolean(token),
    login,
    logout
  }), [token, admin]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth phải được sử dụng bên trong AdminAuthProvider');
  }
  return context;
}

