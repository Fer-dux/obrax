import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OBRAX · Soluciones para la construcción",
    short_name: "OBRAX",
    description: "Presupuestos de hormigón elaborado y materiales para la construcción.",
    lang: "es-AR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1F2A33",
    theme_color: "#1F2A33",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Nuevo presupuesto", short_name: "Presupuesto", url: "/presupuestos/nuevo", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Clientes", url: "/clientes", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
