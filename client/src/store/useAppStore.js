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

function storedUser() {
  try {
    const raw = localStorage.getItem('worksmart-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAppStore = create((set, get) => ({
  theme: initialTheme(),
  currentUser: storedUser(),
  users: [],
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
  setUsers: (users) => set({ users }),
  setCurrentUser: (user) => {
    if (user) {
      try {
        localStorage.setItem('worksmart-user', JSON.stringify(user));
        localStorage.setItem('worksmart-user-id', String(user.id));
      } catch {
        /* ignore */
      }
    } else {
      try {
        localStorage.removeItem('worksmart-user');
        localStorage.removeItem('worksmart-user-id');
      } catch {
        /* ignore */
      }
    }
    set({ currentUser: user });
  },
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
