import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../utils/toast';

const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
apiService.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: centralized error handling
apiService.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error: string; status: number; timestamp: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      // Let individual components handle 404 via empty states
    } else if (error.response && error.response.status >= 500) {
      toast.error(error.response.data?.error || 'Server error. Please try again later.');
    } else if (!error.response) {
      toast.error('Connection failed. Please check your network.');
    }
    return Promise.reject(error);
  }
);

export default apiService;
