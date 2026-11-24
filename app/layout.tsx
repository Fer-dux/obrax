import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const fuente = Montserrat({ subsets: ["latin"], variable: "--fuente" });

export const metadata: Metadata = {
  title: "OBRAX · Soluciones para la construcción",
  description: "Cotizaciones de hormigón elaborado y materiales para la construcción.",
};

export const viewport: Viewport = { themeColor: "#1F2A33", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={fuente.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
