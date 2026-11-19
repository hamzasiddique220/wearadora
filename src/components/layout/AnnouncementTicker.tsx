'use client';

import { useEffect, useState } from 'react';

export interface Announcement {
  /** Desktop text (all messages shown side by side, static). */
  long: string;
  /** Short text for the rotating single-message view on small screens. */
  short: string;
}

/**
 * ≥1024px: every message on one static line — nothing scrolls, nothing is
 * cut mid-word. Below that: one short message at a time, cross-fading every
 * 4s. prefers-reduced-motion → no rotation (first message stays).
 * Fixed 32px height in both modes, so there's no layout shift.
 */
export default function AnnouncementTicker({ messages }: { messages: Announcement[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4000);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="h-8 max-w-[1400px] mx-auto px-4 flex items-center justify-center text-[10px] sm:text-[11px] uppercase">
      {/* Desktop: static list */}
      <ul className="hidden lg:flex items-center gap-8 tracking-[0.25em] whitespace-nowrap">
        {messages.map((m) => (
          <li key={m.long} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-bronze">✦</span>
            {m.long}
          </li>
        ))}
      </ul>

      {/* Mobile / tablet: one message at a time */}
      <div className="lg:hidden relative w-full h-full" aria-live="off">
        {messages.map((m, i) => (
          <p
            key={m.short}
            aria-hidden={i !== index}
            className={`absolute inset-0 flex items-center justify-center gap-2 tracking-[0.18em] whitespace-nowrap transition-opacity duration-500 motion-reduce:transition-none ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span aria-hidden="true" className="text-bronze">✦</span>
            {m.short}
          </p>
        ))}
      </div>
    </div>
  );
}
