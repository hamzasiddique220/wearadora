'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { STORE_CONFIG, SOCIAL_LINKS } from '@/lib/constants';
import { useSiteSettings } from '@/hooks/useSiteSettings';

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.81a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.24z" />
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const jewelryEnabled = settings.jewelryEnabled === true;

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-charcoal text-cream py-12 md:py-16 px-4 sm:px-6 md:px-8 mt-16 md:mt-20 relative overflow-hidden grain">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 relative">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif text-2xl sm:text-3xl tracking-[0.25em] sm:tracking-[0.3em] mb-2">
            {STORE_CONFIG.name}
          </div>
          <div className="text-[10px] tracking-[0.35em] sm:tracking-[0.4em] text-bronze uppercase mb-3 sm:mb-4">
            ✦ {STORE_CONFIG.tagline} ✦
          </div>
          <p className="text-[13px] sm:text-sm text-stone leading-relaxed max-w-md">
            {jewelryEnabled
              ? 'Curated jewelry and artisan footwear for those who appreciate timeless elegance.'
              : 'Artisan handcrafted footwear for those who appreciate timeless elegance.'}
          </p>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase mb-4 text-bronze">
            Shop
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:text-bronze">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/shop?category=Slides" className="hover:text-bronze">
                Slides
              </Link>
            </li>
            <li>
              <Link href="/shop?category=Heels" className="hover:text-bronze">
                Heels
              </Link>
            </li>
            <li>
              <Link href="/shop?category=Sandal" className="hover:text-bronze">
                Sandals
              </Link>
            </li>
            {jewelryEnabled && (
              <>
                <li>
                  <Link href="/shop?category=Necklace" className="hover:text-bronze">
                    Necklaces
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Ring" className="hover:text-bronze">
                    Rings
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase mb-4 text-bronze">
            Help
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-bronze">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-bronze">
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-bronze">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase mb-4 text-bronze">
            Contact
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={14} />
              <a
                href={`tel:+92${STORE_CONFIG.whatsappNumber.slice(2)}`}
                className="hover:text-bronze"
              >
                {STORE_CONFIG.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} /> {STORE_CONFIG.email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} /> {STORE_CONFIG.location}
            </li>
            <li className="text-xs text-stone/80 pt-1 leading-relaxed">
              Delivery in {STORE_CONFIG.deliveryDays} · FREE on 2+ items,
              otherwise Rs. {STORE_CONFIG.deliveryFee}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase mb-4 text-bronze">
            Follow
          </h4>
          <div className="flex gap-3 flex-wrap">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 border border-stone/30 flex items-center justify-center hover:bg-bronze hover:border-bronze transition-colors"
            >
              <Instagram size={16} />
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 border border-stone/30 flex items-center justify-center hover:bg-bronze hover:border-bronze transition-colors"
            >
              <Facebook size={16} />
            </a>
            <a
              href={SOCIAL_LINKS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-10 h-10 border border-stone/30 flex items-center justify-center hover:bg-bronze hover:border-bronze transition-colors"
            >
              <TikTokIcon size={16} />
            </a>
            <a
              href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-10 h-10 border border-stone/30 flex items-center justify-center hover:bg-bronze hover:border-bronze transition-colors"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-10 md:mt-12 pt-6 md:pt-8 border-t border-stone/20 text-[11px] sm:text-xs text-stone/60 tracking-wider flex justify-between flex-wrap gap-2">
        <span>© 2026 {STORE_CONFIG.name}. All rights reserved.</span>
        <span>Handcrafted in Pakistan</span>
      </div>
    </footer>
  );
}
