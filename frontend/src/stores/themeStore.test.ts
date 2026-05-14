/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('themeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.resetModules();
  });

  describe('getInitialTheme', () => {
    it('should use localStorage value when stored as dark', async () => {
      localStorage.setItem('shopbuilder-theme', 'dark');

      const { useThemeStore } = await import('./themeStore');

      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('should use localStorage value when stored as light', async () => {
      localStorage.setItem('shopbuilder-theme', 'light');

      const { useThemeStore } = await import('./themeStore');

      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('should detect OS dark preference when no localStorage value', async () => {
      const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      });

      const { useThemeStore } = await import('./themeStore');

      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('should fallback to light when no localStorage and no OS dark preference', async () => {
      const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      });

      const { useThemeStore } = await import('./themeStore');

      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('should ignore invalid localStorage values and fallback', async () => {
      localStorage.setItem('shopbuilder-theme', 'invalid-value');
      const matchMediaMock = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      });

      const { useThemeStore } = await import('./themeStore');

      expect(useThemeStore.getState().theme).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', async () => {
      localStorage.setItem('shopbuilder-theme', 'light');
      const { useThemeStore } = await import('./themeStore');

      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('should toggle from dark to light', async () => {
      localStorage.setItem('shopbuilder-theme', 'dark');
      const { useThemeStore } = await import('./themeStore');

      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('should persist theme to localStorage on toggle', async () => {
      localStorage.setItem('shopbuilder-theme', 'light');
      const { useThemeStore } = await import('./themeStore');

      useThemeStore.getState().toggleTheme();

      expect(localStorage.getItem('shopbuilder-theme')).toBe('dark');
    });

    it('should add dark class to document.documentElement when toggling to dark', async () => {
      localStorage.setItem('shopbuilder-theme', 'light');
      const { useThemeStore } = await import('./themeStore');

      useThemeStore.getState().toggleTheme();

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class from document.documentElement when toggling to light', async () => {
      localStorage.setItem('shopbuilder-theme', 'dark');
      const { useThemeStore } = await import('./themeStore');

      useThemeStore.getState().toggleTheme();

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('initial theme class application', () => {
    it('should apply dark class on load when initial theme is dark', async () => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shopbuilder-theme', 'dark');

      await import('./themeStore');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should not have dark class on load when initial theme is light', async () => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('shopbuilder-theme', 'light');

      await import('./themeStore');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
