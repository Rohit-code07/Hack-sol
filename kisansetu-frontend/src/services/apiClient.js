// SYNTHETIC DEMO DATA. Illustrative only. Not official records or rates.
import { API_BASE_URL, MOCK_DELAY_MS } from '../config/api';

export class ApiError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Returns a Promise that resolves after MOCK_DELAY_MS with standard backend shape
 * @template T
 * @param {T} data
 * @returns {Promise<{ success: true, data: T }>}
 */
export function mockResponse(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: JSON.parse(JSON.stringify(data)) });
    }, MOCK_DELAY_MS);
  });
}

/**
 * Returns a Promise that rejects with ApiError after MOCK_DELAY_MS
 * @param {string} code
 * @param {string} message
 * @param {number} [status=400]
 * @returns {Promise<never>}
 */
export function mockError(code, message, status = 400) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ApiError(code, message, status));
    }, MOCK_DELAY_MS);
  });
}

/**
 * Get current demo role for API headers
 */
function getDemoRole() {
  try {
    const raw = localStorage.getItem('ks_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.role || 'farmer';
    }
  } catch {
    // fallback
  }
  return 'farmer';
}

/**
 * Client for native fetch requests
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-demo-role': getDemoRole(),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok || body.success === false) {
      const err = body.error || {};
      throw new ApiError(
        err.code || 'HTTP_ERROR',
        err.message || `Request failed with status ${res.status}`,
        res.status
      );
    }

    return body;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('NETWORK_ERROR', error.message || 'Network request failed', 0);
  }
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, data, options) => request(endpoint, { method: 'POST', body: JSON.stringify(data), ...options }),
  put: (endpoint, data, options) => request(endpoint, { method: 'PUT', body: JSON.stringify(data), ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};

export default apiClient;
