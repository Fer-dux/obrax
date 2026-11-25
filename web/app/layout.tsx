import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const fuente = Montserrat({ subsets: ["latin"], variable: "--fuente" });

export const metadata: Metadata = {
  metadataBase: new URL("https://obraxgroup.com.ar"),
  title: "OBRAX · Hormigón elaborado y materiales para la construcción",
  description:
    "Hormigón elaborado H8 a H30, servicio de bombeo y todos los materiales para tu obra en un solo lugar. Pedí tu presupuesto.",
  icons: { icon: [{ url: "/icon.png" }, { url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon.png" },
  openGraph: {
    title: "OBRAX · Soluciones para la construcción",
    description: "Hormigón elaborado y materiales para la construcción. Solidez, confianza y respaldo.",
    locale: "es_AR",
    type: "website",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = { themeColor: "#1F2A33", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={fuente.variable}>
      <body>{children}</body>
    </html>
  );
}
