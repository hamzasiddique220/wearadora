import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f5f1ea',
        sand: '#e8ddc7',
        bronze: '#8b6f47',
        // Darker bronze for SMALL text on cream: 5.3:1 (plain bronze is 4.2:1,
        // below WCAG AA's 4.5:1 for body-size text).
        'bronze-ink': '#7a5f3a',
        charcoal: '#1a1614',
        mocha: '#5a4e42',
        stone: '#d4c9b8',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        'italic-serif': ['var(--font-cormorant-italic)', 'Cormorant', 'serif'],
        // Brand fonts (Logo & Brand Guide)
        wordmark: ['var(--font-italiana)', 'Italiana', 'Cormorant Garamond', 'serif'],
        tagline: ['var(--font-arsenal)', 'Arsenal', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out backwards',
        'scroll': 'scroll 30s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
