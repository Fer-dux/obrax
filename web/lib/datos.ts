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

export const MENSAJE_WHATSAPP = "Hola OBRAX! Quiero pedir un presupuesto.";

export function linkWhatsApp(texto = MENSAJE_WHATSAPP) {
  if (!DATOS.whatsapp) return null;
  return `https://wa.me/${DATOS.whatsapp}?text=${encodeURIComponent(texto)}`;
}
