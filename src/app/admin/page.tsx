'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

export default function AdminIndex() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    router.replace(isLoggedIn ? '/admin/dashboard' : '/admin/login');
  }, [isLoggedIn, router]);

  return null;
}
