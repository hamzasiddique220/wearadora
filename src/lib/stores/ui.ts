'use client';

import { create } from 'zustand';
import { ToastMessage } from '@/types';

interface UIState {
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: null,

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 2500);
  },

  hideToast: () => set({ toast: null }),
}));
