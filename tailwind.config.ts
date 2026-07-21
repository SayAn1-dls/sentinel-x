import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0A0A0A",
        "obsidian-light": "#111111",
        "obsidian-card": "#141414",
        "obsidian-border": "#1E1E1E",
        "obsidian-hover": "#1A1A1A",
        vermilion: "#E63946",
        "vermilion-dark": "#C62D38",
        "vermilion-glow": "rgba(230,57,70,0.15)",
        emerald: "#10B981",
        "emerald-dark": "#059669",
        "emerald-glow": "rgba(16,185,129,0.15)",
        "off-white": "#FCFAF9",
        "off-white-muted": "#A3A3A3",
        "off-white-dim": "#6B6B6B",
        amber: "#F59E0B",
        "amber-glow": "rgba(245,158,11,0.15)",
        "jp-blue": "#003A70",
      },
      fontFamily: {
        heading: ['"Libre Baskerville"', "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "Consolas", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scanLine 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
