'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  /** True once the persisted session has been read from storage. */
  hasHydrated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

// Note: In production, replace this with server-side authentication
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'wearRUHAAFIDAZ321!@#';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      hasHydrated: false,

      login: (password) => {
        if (password === ADMIN_PASSWORD) {
          set({ isLoggedIn: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isLoggedIn: false }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'wearadora-auth',
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      // Only the session flag is persisted — never the hydration marker.
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
