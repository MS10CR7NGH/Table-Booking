import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { useAdminAuth } from '../context/AdminAuthContext';
import { buildApiUrl } from '../utils/api/config';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export function useAuthFetch() {
  const { token, logout } = useAdminAuth();
  const navigate = useNavigate();

  return useCallback(async (endpoint: string, options: FetchOptions = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : buildApiUrl(endpoint);
    const headers = new Headers(options.headers || {});

    if (!options.skipAuth && token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401 && !options.skipAuth) {
      toast.error('Phiên quản trị đã hết hạn, vui lòng đăng nhập lại.');
      logout({ silent: true });
      navigate('/admin/login', { replace: true });
      throw new Error('UNAUTHORIZED');
    }

    return response;
  }, [token, logout, navigate]);
}

