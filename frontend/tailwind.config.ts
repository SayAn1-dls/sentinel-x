import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0E0D0B', 2: '#171512', 3: '#211E1A' },
        paper: '#F2EDE4',
        sand: '#B8AC98',
        accent: { DEFAULT: '#FF5A1F', dark: '#E64A12' },
        sage: '#A3C585',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
