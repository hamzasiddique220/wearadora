'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings, Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import {
  adminSignIn,
  NotAdminError,
  startAdminAuthListener,
  useAdminSession,
} from '@/lib/adminAuth';
import { useUIStore } from '@/lib/stores/ui';

const REASONS: Record<string, string> = {
  notAdmin: 'That account does not have admin access.',
  session: 'Your admin session expired. Please sign in again.',
};

function safeNext(next: string | null): string {
  // Only allow redirects back into /admin (no open redirects).
  return next && next.startsWith('/admin') && !next.startsWith('/admin/login')
    ? next
    : '/admin/dashboard';
}

function authErrorMessage(err: unknown): string {
  if (err instanceof NotAdminError) return err.message;
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a few minutes and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign-in is not enabled in Firebase yet.';
    }
  }
  return 'Sign-in failed. Please try again.';
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const status = useAdminSession((s) => s.status);
  const showToast = useUIStore((state) => state.showToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(REASONS[params.get('reason') || ''] || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startAdminAuthListener();
  }, []);

  // Already signed in as an admin (e.g. cookie expired but Firebase session
  // is still valid) → the listener re-issued the cookie; go straight back.
  useEffect(() => {
    if (status === 'admin') router.replace(next);
  }, [status, next, router]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await adminSignIn(email, password);
      showToast('Welcome back, Admin');
      router.replace(next);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <form onSubmit={handleLogin} className="bg-white p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-charcoal flex items-center justify-center mx-auto mb-4">
            <Settings size={24} color="#f5f1ea" />
          </div>
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Restricted
          </span>
          <h1 className="font-serif text-3xl mt-2">Admin Portal</h1>
          <p className="text-sm text-mocha mt-2">Sign in with your admin account</p>
        </div>

        <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          className="input-field"
          autoFocus
        />

        <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 mt-4 block" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          className="input-field"
        />
        {error && (
          <div role="alert" className="text-xs text-[#c94b4b] mt-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Sign in
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
