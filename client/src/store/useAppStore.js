import { create } from 'zustand';

function initialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('ws-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    /* localStorage unavailable */
  }
  return 'light';
}

export const useAppStore = create((set, get) => ({
  theme: initialTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem('ws-theme', theme);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}));

if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', useAppStore.getState().theme === 'dark');
}
