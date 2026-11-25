import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sistema visual OBRAX Group (rediseño institucional)
        naranja: { DEFAULT: "#F26B21", oscuro: "#D2550F", claro: "#FDE9DC" },
        grafito: { DEFAULT: "#202428", claro: "#2E3338", oscuro: "#181B1E" },
        carbon: "#111315",
        acero: "#92989D",
        mineral: "#F5F5F3",
        hormaco: "#E2231A",
      },
      fontFamily: {
        sans: ["var(--fuente-texto)", "Inter", "system-ui", "sans-serif"],
        titulo: ["var(--fuente-titulo)", "Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
