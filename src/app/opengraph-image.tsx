import { ImageResponse } from 'next/og';
import { STORE_CONFIG } from '@/lib/constants';

export const runtime = 'edge';
export const alt = `${STORE_CONFIG.name} — ${STORE_CONFIG.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The ✦ glyph isn't in the font bundled with next/og, so using it as text
 * made every render try to fetch a Google font for it (logged as "Failed to
 * load dynamic font … Status: 400"). Drawn as SVG instead — no font needed.
 */
function Sparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#d4af37" />
    </svg>
  );
}

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #1a1614 0%, #2a2320 50%, #3a2e24 100%)',
          color: '#f5f1ea',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            color: '#d4af37',
            fontSize: 22,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <Sparkle />
          Handcrafted · 40+ Years of Shoemaking
          <Sparkle />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            color: '#f5f1ea',
          }}
        >
          <div
            style={{
              fontSize: 110,
              letterSpacing: '0.2em',
              fontWeight: 300,
            }}
          >
            {STORE_CONFIG.name}
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            fontSize: 36,
            fontStyle: 'italic',
            color: '#d4af37',
          }}
        >
          {STORE_CONFIG.tagline}
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 22,
            color: '#c9b9a3',
            maxWidth: 880,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 40px',
          }}
        >
          Slides · Heels · Sandals · Necklaces · Rings · Earrings · Bangles
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            color: '#8b6f47',
            fontSize: 20,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          wearadora.com · Karachi, Pakistan
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid rgba(212, 175, 55, 0.25)',
            margin: 30,
            pointerEvents: 'none',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
