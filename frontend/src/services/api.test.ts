import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Mock the auth store before importing api
const mockLogout = vi.fn();
const mockGetState = vi.fn(() => ({ token: null, logout: mockLogout }));

vi.mock('../stores/authStore', () => ({
  useAuthStore: { getState: () => mockGetState() },
}));

// Mock the toast utility
const mockToastError = vi.fn();
vi.mock('../utils/toast', () => ({
  toast: { error: mockToastError, success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

describe('API Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetState.mockReturnValue({ token: null, logout: mockLogout });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Axios instance configuration', () => {
    it('should use VITE_API_BASE_URL as baseURL', async () => {
      const { default: apiService } = await import('./api');
      expect(apiService.defaults.baseURL).toBe(import.meta.env.VITE_API_BASE_URL);
    });

    it('should set Content-Type to application/json', async () => {
      const { default: apiService } = await import('./api');
      expect(apiService.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Request interceptor', () => {
    it('should attach Authorization header when token exists', async () => {
      mockGetState.mockReturnValue({ token: 'test-jwt-token', logout: mockLogout });
      const { default: apiService } = await import('./api');

      const config: InternalAxiosRequestConfig = {
        headers: new (await import('axios')).AxiosHeaders(),
      };

      // Run through request interceptors
      const interceptor = apiService.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>;
      };
      const handler = interceptor.handlers[0];
      const result = handler.fulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
    });

    it('should not attach Authorization header when no token', async () => {
      mockGetState.mockReturnValue({ token: null, logout: mockLogout });
      const { default: apiService } = await import('./api');

      const config: InternalAxiosRequestConfig = {
        headers: new (await import('axios')).AxiosHeaders(),
      };

      const interceptor = apiService.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>;
      };
      const handler = interceptor.handlers[0];
      const result = handler.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response interceptor error handling', () => {
    let responseInterceptorRejected: (error: AxiosError) => Promise<never>;

    beforeEach(async () => {
      const { default: apiService } = await import('./api');
      const interceptor = apiService.interceptors.response as unknown as {
        handlers: Array<{ rejected: (error: AxiosError) => Promise<never> }>;
      };
      responseInterceptorRejected = interceptor.handlers[0].rejected;
    });

    it('should call logout and show toast on 401', async () => {
      const error = {
        response: { status: 401, data: { error: 'Unauthorized', status: 401, timestamp: '' } },
      } as AxiosError<{ error: string; status: number; timestamp: string }>;

      // Mock window.location
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });

      await expect(responseInterceptorRejected(error)).rejects.toEqual(error);
      expect(mockLogout).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith('Session expired. Please log in again.');
      expect(window.location.href).toBe('/login');

      Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    });

    it('should show permission toast on 403', async () => {
      const error = {
        response: { status: 403, data: { error: 'Forbidden', status: 403, timestamp: '' } },
      } as AxiosError<{ error: string; status: number; timestamp: string }>;

      await expect(responseInterceptorRejected(error)).rejects.toEqual(error);
      expect(mockToastError).toHaveBeenCalledWith('You do not have permission to perform this action.');
    });

    it('should not show toast on 404 (components handle it)', async () => {
      const error = {
        response: { status: 404, data: { error: 'Not found', status: 404, timestamp: '' } },
      } as AxiosError<{ error: string; status: number; timestamp: string }>;

      await expect(responseInterceptorRejected(error)).rejects.toEqual(error);
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('should show server error toast on 5xx with message from response', async () => {
      const error = {
        response: { status: 500, data: { error: 'Database connection failed', status: 500, timestamp: '' } },
      } as AxiosError<{ error: string; status: number; timestamp: string }>;

      await expect(responseInterceptorRejected(error)).rejects.toEqual(error);
      expect(mockToastError).toHaveBeenCalledWith('Database connection failed');
    });

    it('should show generic server error toast on 5xx without message', async () => {
      const error = {
        response: { status: 502, data: null },
      } as unknown as AxiosError<{ error: string; status: number; timestamp: string }>;

      await expect(responseInterceptorRejected(error)).rejects.toEqual(error);
      expect(mockToastError).toHaveBeenCalledWith('Server error. Please try again later.');
    });

    it('should show network error toast when no response', async () => {
      const error = {
        response: undefined,
      } as AxiosError<{ error: string; status: number; timestamp: string }>;

      await expect(responseInterceptorRejected(error)).rejects.toEqual(error);
      expect(mockToastError).toHaveBeenCalledWith('Connection failed. Please check your network.');
    });
  });
});
