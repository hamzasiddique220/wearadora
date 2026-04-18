'use client';

import { useEffect, useRef } from 'react';

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const el = barRef.current;
      if (!el) return;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      el.style.transform = `scaleX(${pct / 100})`;
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 10001,
        pointerEvents: 'none',
        background: 'rgba(26,22,20,0.06)',
      }}
    >
      <div
        ref={barRef}
        style={{
          height: '100%',
          width: '100%',
          background:
            'linear-gradient(90deg, var(--bronze, #8b6f47), #c8a66b, var(--bronze, #8b6f47))',
          transform: 'scaleX(0)',
          transformOrigin: '0 50%',
          transition: 'transform 0.12s linear',
        }}
      />
    </div>
  );
}
