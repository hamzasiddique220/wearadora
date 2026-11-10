'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, Package, ShoppingBag, LogOut, Home, Settings, Star } from 'lucide-react';
import { adminSignOut, startAdminAuthListener, useAdminSession } from '@/lib/adminAuth';
import { STORE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useAdminSession((s) => s.status);
  const email = useAdminSession((s) => s.email);

  useEffect(() => {
    startAdminAuthListener();
  }, []);

  useEffect(() => {
    // The server layout already verified the cookie; this covers the client
    // side (signed out in another tab, claim removed, token revoked).
    if (status === 'signedOut' || status === 'notAdmin') {
      router.replace(
        `/admin/login?reason=${status}&next=${encodeURIComponent(pathname || '/admin/dashboard')}`
      );
    }
  }, [status, router, pathname]);

  // Don't mount admin pages (and their Firestore listeners) until Firebase
  // Auth has restored an admin user — otherwise the first reads go out
  // unauthenticated and are denied by the rules.
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-bronze text-[11px] tracking-[0.3em] uppercase animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  if (status !== 'admin') {
    return null;
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/reviews', label: 'Reviews', icon: Star },
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
            {email && (
              <span className="hidden lg:inline text-[11px] text-stone">{email}</span>
            )}
            <button
              onClick={async () => {
                await adminSignOut();
                router.replace('/admin/login?reason=signedOut');
              }}
              className="p-2 text-stone hover:text-white"
              title="Sign out"
              aria-label="Sign out"
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
