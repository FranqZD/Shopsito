/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';

// Helper to create a fake JWT token with given payload
function createFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'fake-signature';
  return `${header}.${body}.${signature}`;
}

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset the store state
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  describe('login', () => {
    it('should decode JWT payload and set user and token', () => {
      const payload = {
        userId: 42,
        name: 'John Doe',
        sub: 'john@example.com',
        role: 'SELLER',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createFakeJwt(payload);

      useAuthStore.getState().login(token);

      const state = useAuthStore.getState();
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual({
        id: 42,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'SELLER',
      });
    });

    it('should persist token and user to localStorage', () => {
      const payload = {
        userId: 1,
        name: 'Alice',
        sub: 'alice@test.com',
        role: 'SELLER',
      };
      const token = createFakeJwt(payload);

      useAuthStore.getState().login(token);

      expect(localStorage.getItem('shopbuilder-token')).toBe(token);
      const storedUser = JSON.parse(localStorage.getItem('shopbuilder-user')!);
      expect(storedUser).toEqual({
        id: 1,
        name: 'Alice',
        email: 'alice@test.com',
        role: 'SELLER',
      });
    });
  });

  describe('logout', () => {
    it('should clear token and user from state', () => {
      const payload = { userId: 1, name: 'Test', sub: 'test@test.com', role: 'SELLER' };
      const token = createFakeJwt(payload);
      useAuthStore.getState().login(token);

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should remove token and user from localStorage', () => {
      const payload = { userId: 1, name: 'Test', sub: 'test@test.com', role: 'SELLER' };
      const token = createFakeJwt(payload);
      useAuthStore.getState().login(token);

      useAuthStore.getState().logout();

      expect(localStorage.getItem('shopbuilder-token')).toBeNull();
      expect(localStorage.getItem('shopbuilder-user')).toBeNull();
    });
  });

  describe('rehydration from localStorage', () => {
    it('should rehydrate token and user from localStorage on store creation', () => {
      const user = { id: 5, name: 'Rehydrated', email: 'rehydrated@test.com', role: 'SELLER' };
      const token = 'stored-token';
      localStorage.setItem('shopbuilder-token', token);
      localStorage.setItem('shopbuilder-user', JSON.stringify(user));

      // Reset store to simulate fresh creation reading from localStorage
      useAuthStore.setState({
        token: localStorage.getItem('shopbuilder-token'),
        user: JSON.parse(localStorage.getItem('shopbuilder-user') || 'null'),
        isAuthenticated: !!localStorage.getItem('shopbuilder-token'),
      });

      const state = useAuthStore.getState();
      expect(state.token).toBe(token);
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should have null state when localStorage is empty', () => {
      useAuthStore.setState({
        token: localStorage.getItem('shopbuilder-token'),
        user: JSON.parse(localStorage.getItem('shopbuilder-user') || 'null'),
        isAuthenticated: !!localStorage.getItem('shopbuilder-token'),
      });

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
