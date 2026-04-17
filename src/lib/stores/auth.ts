'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

// Note: In production, replace this with server-side authentication
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'wearadora2026';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,

      login: (password) => {
        if (password === ADMIN_PASSWORD) {
          set({ isLoggedIn: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isLoggedIn: false }),
    }),
    {
      name: 'wearadora-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
