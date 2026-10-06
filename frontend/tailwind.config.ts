import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neon-orange': '#FF6B00',
        'neon-red': '#FF0033',
        'neon-cyan': '#00CFFF',
        'neon-green': '#00FF88',
        'neon-gold': '#FFD700',
        'silicon': 'rgba(10,10,10,0.6)',
        'hud-border': 'rgba(255,255,255,0.08)',
      },
      backdropBlur: {
        'silicon': '60px',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.6', filter: 'brightness(1.5)' },
        },
        'data-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
      animation: {
        scanline: 'scanline 6s linear infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'data-scroll': 'data-scroll 20s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
