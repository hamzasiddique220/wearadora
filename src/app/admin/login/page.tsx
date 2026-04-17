'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const showToast = useUIStore((state) => state.showToast);

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const success = login(password);
    if (success) {
      showToast('Welcome back, Admin');
      router.push('/admin/dashboard');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="bg-white p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-charcoal flex items-center justify-center mx-auto mb-4">
            <Settings size={24} color="#f5f1ea" />
          </div>
          <span className="text-[10px] tracking-[0.4em] uppercase text-bronze">
            ✦ Restricted
          </span>
          <h2 className="font-serif text-3xl mt-2">Admin Portal</h2>
          <p className="text-sm text-mocha mt-2">Enter password to continue</p>
        </div>

        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-mocha mb-2 block">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="input-field"
            placeholder="Enter admin password"
            autoFocus
          />
          {error && <div className="text-xs text-[#c94b4b] mt-2">{error}</div>}
        </div>

        <button onClick={handleLogin} className="btn-primary w-full mt-6">
          Login to Dashboard
        </button>
      </div>
    </div>
  );
}
