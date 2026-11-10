'use client';

import { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useVisibleProductsData, useSiteSettingsData } from '@/lib/stores/data';
import { STORE_CONFIG } from '@/lib/constants';
import { formatPrice, productHandle } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { jewelryCategoryHref } from '@/lib/categories';
import { slippersCategoryHref } from '@/lib/footwearCategories';

interface HeaderProps {
  /**
   * Server-fetched jewelryEnabled — used as the source of truth until the
   * client-side data store finishes hydrating, so /jewelry links render in
   * the initial HTML (SEO + no post-hydration flicker).
   */
  initialJewelryEnabled?: boolean;
}

export default function Header({ initialJewelryEnabled = false }: HeaderProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const cartCount = useCartStore((state) => state.getCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { products, jewelryEnabled: storeJewelryEnabled } =
    useVisibleProductsData();
  const { loading: settingsLoading } = useSiteSettingsData();
  // Prefer the server-fetched value until the client store has loaded — this
  // keeps SSR and first client render identical (no hydration mismatch).
  const jewelryEnabled = settingsLoading
    ? initialJewelryEnabled
    : storeJewelryEnabled;
  const deferredQuery = useDeferredValue(searchQuery);

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
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && String(p.category).toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [deferredQuery, products]);

  if (pathname?.startsWith('/admin')) return null;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/slippers', label: 'Shoes' },
    ...(jewelryEnabled
      ? [
          {
            href: '/jewelry',
            label: 'Artificial Jewellery',
          },
        ]
      : []),
    { href: '/blog', label: 'Journal' },
    { href: '/about', label: 'About' },
  ];

  // Real links to the canonical /jewelry/[category] & /slippers/[category]
  // SEO pages — not /shop?category=, which a crawler never sees since these
  // used to render as onClick buttons rather than <Link>s.
  const quickLinks = [
    { label: 'Slides', href: slippersCategoryHref('Slides') },
    { label: 'Heels', href: slippersCategoryHref('Heels') },
    { label: 'Sandal', href: slippersCategoryHref('Sandal') },
    ...(jewelryEnabled
      ? [
          { label: 'Necklace', href: jewelryCategoryHref('Necklace') },
          { label: 'Ring', href: jewelryCategoryHref('Ring') },
          { label: 'Earring', href: jewelryCategoryHref('Earring') },
        ]
      : []),
  ];

  const closeAll = () => {
    setSearchOpen(false);
    setMobileMenu(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-stone">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-8 py-3 md:py-4 grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center gap-2 sm:gap-4">
          {/* LEFT — menu toggle (mobile) + brand logo */}
          <div className="flex items-center gap-2 sm:gap-3 justify-self-start min-w-0">
            <button
              className="md:hidden p-1 -ml-1 shrink-0"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

            <Link
              href="/"
              className="flex items-center min-w-0 shrink-0"
              aria-label={`${STORE_CONFIG.name} — ${STORE_CONFIG.tagline}`}
            >
              <Image
                src="/wearadora-wordmark-dark.png"
                alt={STORE_CONFIG.name}
                width={2600}
                height={760}
                // Eager (above the fold) but NOT priority — priority preloads it
                // with fetchpriority=high, competing with the hero LCP image.
                loading="eager"
                sizes="(min-width: 768px) 330px, (min-width: 640px) 220px, 140px"
                className="h-10 sm:h-16 md:h-24 w-auto object-contain"
              />
            </Link>
          </div>

          {/* CENTER — primary navigation */}
          <nav className="hide-mobile justify-self-center flex gap-8 text-xs tracking-[0.15em] uppercase">
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

          {/* RIGHT — actions */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 justify-self-end">
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-bronze transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link
              href="/wishlist"
              aria-label={
                wishlistCount > 0
                  ? `Wishlist, ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}`
                  : 'Wishlist'
              }
              className="relative hover:text-bronze hide-mobile transition-colors"
            >
              <Heart size={20} aria-hidden="true" />
              {wishlistCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 bg-bronze text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              aria-label={
                cartCount > 0
                  ? `Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`
                  : 'Cart'
              }
              className="relative hover:text-bronze transition-colors"
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 bg-bronze text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </span>
              )}
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
              className="block text-xs tracking-[0.2em] uppercase py-2"
            >
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
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
                placeholder={jewelryEnabled ? 'Search jewelry, shoes...' : 'Search shoes...'}
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
                    {quickLinks.map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        onClick={closeAll}
                        className="px-4 py-2 border border-stone text-xs tracking-[0.15em] uppercase hover:border-charcoal hover:bg-white transition"
                      >
                        {cat.label}
                      </Link>
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
                        router.push(`/product/${productHandle(p)}`);
                        closeAll();
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-sand/50 border-b border-stone/50 text-left transition"
                    >
                      <div className="relative w-14 h-14 bg-cream overflow-hidden shrink-0">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1 mix-blend-darken"
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
