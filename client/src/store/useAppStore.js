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

const DEFAULT_USER = { id: 1, name: 'James Wong', department: 'Procurement', role: 'admin' };

export const useAppStore = create((set, get) => ({
  theme: initialTheme(),
  currentUser: DEFAULT_USER,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
  setCurrentUser: (user) => set({ currentUser: user }),
}));

// Side effects live outside the store: keep state pure, sync DOM + persistence here.
function applyTheme(theme) {
  try {
    localStorage.setItem('ws-theme', theme);
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

applyTheme(useAppStore.getState().theme);
useAppStore.subscribe((state, prev) => {
  if (state.theme !== prev.theme) applyTheme(state.theme);
});
