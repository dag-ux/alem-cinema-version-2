/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ═══════════ FONTS ═══════════
      fontFamily: {
        // Body / UI — used everywhere by default
        sans: [
          "Inter",
          "Noto Sans Ethiopic",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        // Headings — elegant cinematic serif
        display: [
          "Playfair Display",
          "Noto Sans Ethiopic",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        // Amharic fallback
        ethiopic: [
          "Noto Sans Ethiopic",
          "Inter",
          "sans-serif",
        ],
        // Pure monospace for seat numbers / ticket codes (optional)
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },

      // ═══════════ CINEMATIC LETTER-SPACING ═══════════
      letterSpacing: {
        cinematic: "0.35em", // for uppercase labels
        widest: "0.25em",
      },

      // ═══════════ CUSTOM COLORS (optional — matches your brand) ═══════════
      colors: {
        brand: {
          DEFAULT: "#f47920",
          light: "#ff9a5c",
          dark: "#d4681a",
          deep: "#b8560f",
        },
      },

      // ═══════════ ANIMATIONS ═══════════
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};