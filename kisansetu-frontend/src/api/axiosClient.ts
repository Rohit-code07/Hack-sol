import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Base URL resolution: ensure base URL points to the Spring Boot server (with or without /api/v1 suffix)
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const apiBaseUrl = rawBaseUrl.endsWith('/api/v1')
  ? rawBaseUrl
  : rawBaseUrl.endsWith('/api')
  ? `${rawBaseUrl}/v1`
  : `${rawBaseUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Retrieve current JWT token safely from localStorage
 */
export function getStoredToken(): string | null {
  try {
    const directToken = localStorage.getItem('ks_token');
    if (directToken) return directToken;

    const rawAuth = localStorage.getItem('ks_auth');
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      return parsed.token || null;
    }
  } catch {
    // ignore json parse error
  }
  return null;
}

/**
 * Custom application API error with status and code
 */
export class ApiError extends Error {
  code: string;
  status: number;
  data: any;

  constructor(code: string, message: string, status = 400, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle status codes, timeouts, and auth expiration
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(
        new ApiError('TIMEOUT_ERROR', 'The request to the KisanSetu backend server timed out. Please check your connection.', 408)
      );
    }

    if (!error.response) {
      return Promise.reject(
        new ApiError('NETWORK_ERROR', 'Unable to reach KisanSetu backend server at ' + apiBaseUrl + '. Please verify the backend is running.', 0)
      );
    }

    const { status, data } = error.response as { status: number; data: any };

    if (status === 401) {
      // Clear token and authentication state
      try {
        localStorage.removeItem('ks_token');
        const auth = localStorage.getItem('ks_auth');
        if (auth) {
          const parsed = JSON.parse(auth);
          parsed.token = null;
          parsed.isAuthenticated = false;
          localStorage.setItem('ks_auth', JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }

      // Notify window of session expiry
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ks:unauthorized'));
      }

      const message = data?.message || 'Your session has expired. Please log in again.';
      return Promise.reject(new ApiError('UNAUTHORIZED', message, 401, data));
    }

    if (status === 403) {
      const message = data?.message || 'Access Denied: You do not have permission to perform this action.';
      return Promise.reject(new ApiError('FORBIDDEN', message, 403, data));
    }

    const errorMessage = data?.message || error.message || 'An unexpected error occurred';
    const errorCode = data?.error || 'HTTP_ERROR_' + status;

    return Promise.reject(new ApiError(errorCode, errorMessage, status, data));
  }
);

export default apiClient;
