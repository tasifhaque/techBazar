import { create } from "zustand";
import { api, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; gender: string }) => Promise<{ email: string; token: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  checkAuth: async () => {
    try {
      const { user } = await api.auth.me();
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  login: async (email, password) => {
    const { user } = await api.auth.login({ email, password });
    set({ user, isAuthenticated: true });
  },
  signup: async (data) => {
    const res = await api.auth.signup(data);
    return res;
  },
  logout: async () => {
    await api.auth.logout();
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
