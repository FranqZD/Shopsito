import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SELLER';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('shopbuilder-token'),
  user: JSON.parse(localStorage.getItem('shopbuilder-user') || 'null'),
  isAuthenticated: !!localStorage.getItem('shopbuilder-token'),
  login: (token: string) => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const user: User = { id: payload.userId, name: payload.name, email: payload.sub, role: payload.role };
    localStorage.setItem('shopbuilder-token', token);
    localStorage.setItem('shopbuilder-user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('shopbuilder-token');
    localStorage.removeItem('shopbuilder-user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
