/** @type {import('tailwindcss').Config} */
// Scoped Tailwind for shadcn components. Existing global.css / *.module.css
// rules stay untouched; Tailwind utilities apply only where used in JSX
// (mostly src/components/ui/*).
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Bridge to existing CSS variables so shadcn primitives blend with
        // the pink/orange palette already used by the rest of the app.
        border: 'rgba(255, 255, 255, 0.12)',
        input: 'rgba(255, 255, 255, 0.08)',
        ring: 'var(--zzz-pink, #FDB2C8)',
        background: 'rgba(20, 20, 28, 0.96)',
        foreground: '#eee',
        muted: {
          DEFAULT: 'rgba(255, 255, 255, 0.04)',
          foreground: '#999',
        },
        popover: {
          DEFAULT: 'rgba(20, 20, 28, 0.97)',
          foreground: '#eee',
        },
        accent: {
          DEFAULT: 'rgba(253, 178, 200, 0.12)',
          foreground: '#fff',
        },
        primary: {
          DEFAULT: 'var(--zzz-pink, #FDB2C8)',
          foreground: '#000',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
