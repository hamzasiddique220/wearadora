'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, Package, ShoppingBag, LogOut, Home, Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { STORE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Wait for the persisted session to load before deciding to redirect,
    // otherwise a fresh load / refresh bounces a logged-in admin to login.
    if (hasHydrated && !isLoggedIn && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [hasHydrated, isLoggedIn, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-bronze text-[11px] tracking-[0.3em] uppercase animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-cream border-b border-stone/20 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5"
            aria-label={`${STORE_CONFIG.name} Admin`}
          >
            <Image
              src="/wearadora-wordmark-light.png"
              alt={STORE_CONFIG.name}
              width={2600}
              height={760}
              className="h-10 w-auto object-contain"
            />
            <span className="text-bronze text-xs tracking-[0.3em]">ADMIN</span>
          </Link>

          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-xs tracking-[0.2em] uppercase flex items-center gap-2 transition-colors',
                  pathname === item.href
                    ? 'bg-bronze text-white'
                    : 'text-stone hover:text-white'
                )}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 text-stone hover:text-white"
              title="View Site"
            >
              <Home size={18} />
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/admin/login');
              }}
              className="p-2 text-stone hover:text-white"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex justify-around border-t border-stone/20 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 py-3 text-[10px] tracking-[0.2em] uppercase flex flex-col items-center gap-1 transition-colors',
                pathname === item.href ? 'text-bronze' : 'text-stone'
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div>{children}</div>
    </div>
  );
}
