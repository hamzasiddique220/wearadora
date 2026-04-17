'use client';

import { Check, AlertCircle } from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui';

export default function Toast() {
  const toast = useUIStore((state) => state.toast);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 text-sm tracking-wider z-[100] animate-in ${
        isError ? 'bg-[#c94b4b] text-white' : 'bg-charcoal text-cream'
      }`}
      style={{ borderRadius: 0 }}
    >
      <div className="flex items-center gap-2">
        {isError ? <AlertCircle size={16} /> : <Check size={16} />}
        {toast.message}
      </div>
    </div>
  );
}
