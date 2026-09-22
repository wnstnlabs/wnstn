import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canopy: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#ff4d00",
          600: "#ea580c",
          900: "#7c2d12",
          bg: "#070709",
          surface: "#0f0f12",
          "surface-2": "#131316",
          border: "rgba(255,255,255,0.07)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.42), 0 2px 8px rgba(0,0,0,0.32)",
        elevated: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 16px 40px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
