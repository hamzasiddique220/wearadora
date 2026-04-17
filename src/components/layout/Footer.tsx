'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/constants';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-charcoal text-cream py-16 px-4 md:px-8 mt-20 relative overflow-hidden grain">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-10 relative">
        <div>
          <div className="font-serif text-3xl tracking-[0.3em] mb-2">
            {STORE_CONFIG.name}
          </div>
          <div className="text-[10px] tracking-[0.4em] text-bronze uppercase mb-4">
            ✦ {STORE_CONFIG.tagline} ✦
          </div>
          <p className="text-sm text-stone leading-relaxed">
            Curated jewelry and artisan footwear for those who appreciate timeless
            elegance.
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
              <Link href="/shop?category=Necklace" className="hover:text-bronze">
                Necklaces
              </Link>
            </li>
            <li>
              <Link href="/shop?category=Ring" className="hover:text-bronze">
                Rings
              </Link>
            </li>
            <li>
              <Link href="/shop?category=Sandal" className="hover:text-bronze">
                Sandals
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
              <Phone size={14} /> 0311 2032415
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} /> {STORE_CONFIG.email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} /> {STORE_CONFIG.location}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase mb-4 text-bronze">
            Follow
          </h4>
          <div className="flex gap-3">
            <a
              href="#"
              className="w-10 h-10 border border-stone/30 flex items-center justify-center hover:bg-bronze hover:border-bronze transition-colors"
            >
              <Instagram size={16} />
            </a>
            <a
              href="#"
              className="w-10 h-10 border border-stone/30 flex items-center justify-center hover:bg-bronze hover:border-bronze transition-colors"
            >
              <Facebook size={16} />
            </a>
            <a
              href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-stone/30 flex items-center justify-center hover:bg-bronze hover:border-bronze transition-colors"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-12 pt-8 border-t border-stone/20 text-xs text-stone/60 tracking-wider flex justify-between flex-wrap gap-2">
        <span>© 2026 {STORE_CONFIG.name}. All rights reserved.</span>
        <span>Handcrafted in Pakistan</span>
      </div>
    </footer>
  );
}
