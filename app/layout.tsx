import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const fuente = Montserrat({ subsets: ["latin"], variable: "--fuente" });

export const metadata: Metadata = {
  title: "OBRAX · Soluciones para la construcción",
  description: "Cotizaciones de hormigón elaborado y materiales para la construcción.",
  applicationName: "OBRAX",
  appleWebApp: { capable: true, title: "OBRAX", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon.png", sizes: "64x64", type: "image/png" }, { url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1F2A33",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={fuente.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
