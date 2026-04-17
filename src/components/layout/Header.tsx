'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  Settings,
} from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { STORE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const pathname = usePathname();

  const cartCount = useCartStore((state) => state.getCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);

  // Don't show header on admin pages
  if (pathname?.startsWith('/admin')) return null;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/shop', label: 'Collections' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-stone">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <button
          className="md:hidden"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        <nav className="hide-mobile flex gap-8 text-xs tracking-[0.15em] uppercase">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className={cn(
                'hover:text-bronze transition-colors',
                pathname === link.href && 'text-bronze'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="flex flex-col items-center">
          <div className="font-serif text-2xl md:text-3xl tracking-[0.3em] font-light">
            {STORE_CONFIG.name}
          </div>
          <div className="text-[9px] tracking-[0.4em] text-bronze uppercase mt-0.5 hide-mobile">
            ✦ {STORE_CONFIG.tagline} ✦
          </div>
        </Link>

        <div className="flex items-center gap-4 md:gap-5">
          <Link href="/shop" className="hover:text-bronze">
            <Search size={20} />
          </Link>

          <Link href="/wishlist" className="relative hover:text-bronze hide-mobile">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-bronze text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative hover:text-bronze">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-bronze text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/login"
            className="hover:text-bronze hide-mobile"
            aria-label="Admin"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>

      {mobileMenu && (
        <div className="md:hidden bg-cream border-t border-stone py-4 px-6 space-y-3">
          {['/', '/shop', '/about', '/wishlist', '/admin/login'].map((href, i) => {
            const labels = ['Home', 'Shop', 'About', 'Wishlist', 'Admin'];
            return (
              <Link
                key={i}
                href={href}
                onClick={() => setMobileMenu(false)}
                className="block text-xs tracking-[0.2em] uppercase py-2 border-b border-stone"
              >
                {labels[i]}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
