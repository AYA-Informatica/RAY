import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  userId: string;
  phone: string;
  name?: string;
  location?: string;
  avatar?: string;
  isVerified?: boolean;
  joinedAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, userId: string) => void;
  completeOnboarding: (name: string, location: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: (phone: string, userId: string) => {
        set({
          user: {
            userId,
            phone,
            joinedAt: new Date().toISOString(),
          },
          isAuthenticated: true,
        });
      },
      completeOnboarding: (name: string, location: string) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              name,
              location,
              isVerified: true,
            },
          };
        });
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
      hydrate: () => {
        set({ isLoading: false });
      },
    }),
    {
      name: 'ray_auth',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrate();
        }
      },
    }
  )
);
