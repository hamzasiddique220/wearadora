'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  Settings,
  X,
} from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useProducts } from '@/hooks/useProducts';
import { STORE_CONFIG } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const cartCount = useCartStore((state) => state.getCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { products } = useProducts();

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && String(p.category).toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [searchQuery, products]);

  if (pathname?.startsWith('/admin')) return null;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/jewelry', label: 'Jewelry' },
    { href: '/slippers', label: 'Slippers' },
    { href: '/about', label: 'About' },
  ];

  const closeAll = () => {
    setSearchOpen(false);
    setMobileMenu(false);
    setSearchQuery('');
  };

  return (
    <>
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'hover:text-bronze transition-colors relative py-1',
                  pathname === link.href &&
                    'text-bronze after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-bronze'
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
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-bronze transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link
              href="/wishlist"
              className="relative hover:text-bronze hide-mobile transition-colors"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-bronze text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative hover:text-bronze transition-colors"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-bronze text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/login"
              className="hover:text-bronze hide-mobile transition-colors"
              aria-label="Admin"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-cream border-t border-stone py-4 px-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenu(false)}
                className={cn(
                  'block text-xs tracking-[0.2em] uppercase py-2 border-b border-stone',
                  pathname === link.href && 'text-bronze'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={() => setMobileMenu(false)}
              className="block text-xs tracking-[0.2em] uppercase py-2 border-b border-stone"
            >
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenu(false)}
              className="block text-xs tracking-[0.2em] uppercase py-2"
            >
              Admin
            </Link>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 animate-in">
          <div className="bg-cream w-full max-w-2xl mt-12 md:mt-20 shadow-2xl">
            <div className="flex items-center gap-3 p-4 md:p-6 border-b border-stone">
              <Search size={20} className="text-bronze shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewelry, slippers..."
                className="flex-1 bg-transparent outline-none text-base md:text-lg font-serif"
              />
              <button
                onClick={closeAll}
                className="w-8 h-8 flex items-center justify-center hover:bg-sand rounded-full"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div className="p-6 text-center text-mocha">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-bronze mb-3">
                    ✦ Quick Links
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Necklace', 'Ring', 'Earring', 'Sandal', 'Khussa'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          router.push(`/shop?category=${cat}`);
                          closeAll();
                        }}
                        className="px-4 py-2 border border-stone text-xs tracking-[0.15em] uppercase hover:border-charcoal hover:bg-white transition"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-mocha">
                    No products match &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              ) : (
                <div>
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        router.push(`/shop?product=${p.id}`);
                        closeAll();
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-sand/50 border-b border-stone/50 text-left transition"
                    >
                      <div className="w-14 h-14 bg-sand overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] tracking-[0.3em] uppercase text-bronze">
                          {p.category}
                        </div>
                        <div className="font-serif text-base truncate">{p.name}</div>
                      </div>
                      <div className="text-sm font-medium shrink-0">
                        {formatPrice(p.price)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
