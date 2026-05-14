import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('shopbuilder-theme') as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
};

const applyThemeClass = (theme: Theme): void => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// Apply initial theme class on store creation
const initialTheme = getInitialTheme();
applyThemeClass(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('shopbuilder-theme', next);
      applyThemeClass(next);
      return { theme: next };
    }),
}));
