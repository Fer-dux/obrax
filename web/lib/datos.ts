/**
 * DATOS DE CONTACTO DE OBRAX
 * ─────────────────────────
 * Completá estos campos y la web se actualiza sola (botones de WhatsApp,
 * teléfono, email, dirección y mapa). Si un campo queda vacío, ese dato
 * no se muestra.
 */
export const DATOS = {
  /** WhatsApp con código de país, sin espacios ni signos. Ej: "5491112345678" */
  whatsapp: "",
  /** Teléfono tal como querés que se vea. Ej: "+54 9 11 1234-5678" */
  telefono: "",
  email: "contacto@obraxgroup.com.ar",
  direccion: "",
  localidad: "",
  horarios: "Lunes a viernes de 7 a 17 h · Sábados de 7 a 12 h",
  zonas: ["CABA", "GBA Norte", "GBA Oeste", "GBA Sur"],
  instagram: "",
  /** Dirección de la app comercial (acceso del equipo) */
  app: "https://app.obraxgroup.com.ar",
};

/** Empresas que respaldan a OBRAX Group (una por unidad de negocio). */
type Empresa = {
  nombre: string;
  rubro: string;
  unidad: string;
  texto: string;
  web: string;
  /** Opcional: si no hay logo se muestra el nombre. */
  logo?: { src: string; ancho: number; alto: number };
};

export const RESPALDO: Empresa[] = [
  {
    nombre: "Hormaco",
    rubro: "Servicio de hormigón elaborado",
    unidad: "Hormigón",
    texto: "Planta, flota de mixers y experiencia técnica en hormigón elaborado detrás de cada entrega de OBRAX.",
    web: "https://hormaco.com.ar",
    logo: { src: "/logos/hormaco.png", ancho: 429, alto: 89 },
  },
  {
    nombre: "Palermo Materiales",
    rubro: "Materiales para la construcción",
    unidad: "Materiales",
    texto: "Corralón con amplio surtido y stock: cemento, áridos, ladrillos, impermeabilizantes y más.",
    web: "https://palermomateriales.com.ar",
    logo: { src: "/logos/palermo-materiales.png", ancho: 199, alto: 61 },
  },
];

export const MENSAJE_WHATSAPP = "Hola OBRAX! Quiero pedir un presupuesto.";

export function linkWhatsApp(texto = MENSAJE_WHATSAPP) {
  if (!DATOS.whatsapp) return null;
  return `https://wa.me/${DATOS.whatsapp}?text=${encodeURIComponent(texto)}`;
}
