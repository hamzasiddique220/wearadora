import { STORE_CONFIG, DELIVERY_TEXT } from '@/lib/constants';
import type { SiteSale } from '@/types';
import AnnouncementTicker, { type Announcement } from './AnnouncementTicker';

interface AnnouncementBarProps {
  /** siteSettings.sale — only shown when really active. */
  sale?: SiteSale | null;
}

function activeSale(sale?: SiteSale | null): string | null {
  if (!sale?.active || !sale.text?.trim()) return null;
  if (sale.endsAt) {
    const ends = new Date(sale.endsAt);
    if (Number.isNaN(ends.getTime()) || ends.getTime() <= Date.now()) return null;
    const date = ends.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
    return `${sale.text.trim()} · ends ${date}`;
  }
  return sale.text.trim();
}

/**
 * At most 3 factual messages. No "Mega Sale" unless a real sale is set in
 * siteSettings.sale; no "40+ years" (the heroes already say it); delivery
 * time comes from the shared DELIVERY_TEXT constant.
 */
export default function AnnouncementBar({ sale }: AnnouncementBarProps) {
  const free = STORE_CONFIG.freeDeliveryMinTotal.toLocaleString('en-PK');
  const saleText = activeSale(sale);

  const messages: Announcement[] = [
    ...(saleText ? [{ long: saleText, short: saleText }] : []),
    { long: `Free delivery on orders Rs ${free}+`, short: `Free delivery Rs ${free}+` },
    {
      long: `Cash on delivery · Delivery in ${DELIVERY_TEXT.short}`,
      short: `COD · Delivery in ${DELIVERY_TEXT.short}`,
    },
    { long: '7-day exchange & refund', short: '7-day exchange & refund' },
  ].slice(0, 3);

  return (
    <div className="bg-charcoal text-cream" role="region" aria-label="Store announcements">
      <AnnouncementTicker messages={messages} />
    </div>
  );
}
