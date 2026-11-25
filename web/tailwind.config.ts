import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        naranja: { DEFAULT: "#EE7623", oscuro: "#C95F12", claro: "#FDEBDD" },
        grafito: { DEFAULT: "#1F2A33", claro: "#3A4752", oscuro: "#151D23" },
      },
      fontFamily: { sans: ["var(--fuente)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
