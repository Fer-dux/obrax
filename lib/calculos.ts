import type { CondicionFiscal, Item, UnidadNegocio } from "./tipos";

/** Precios cargados CON IVA incluido (como en las listas de corralón). */
export const redondear = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const importe = (i: Pick<Item, "cantidad" | "precio">) =>
  redondear((Number(i.cantidad) || 0) * (Number(i.precio) || 0));

export function totales(items: Item[], descuentoPct = 0) {
  const factor = 1 - (Number(descuentoPct) || 0) / 100;
  const porUnidad: Record<UnidadNegocio, number> = { hormigon: 0, materiales: 0 };
  let bruto = 0;
  let neto = 0;
  for (const i of items) {
    const imp = importe(i);
    porUnidad[i.unidad_negocio] += imp;
    bruto += imp;
    neto += (imp * factor) / (1 + (Number(i.iva) || 0) / 100);
  }
  const total = redondear(bruto * factor);
  const netoR = redondear(neto);
  return {
    bruto: redondear(bruto),
    descuento: redondear(bruto - total),
    total,
    neto: netoR,
    iva: redondear(total - netoR),
    hormigon: redondear(porUnidad.hormigon * factor),
    materiales: redondear(porUnidad.materiales * factor),
  };
}

/** Responsable inscripto → Factura A (IVA discriminado). Resto → Factura B. */
export const discriminaIva = (c?: CondicionFiscal | null) => c === "responsable_inscripto";

export const pesos = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(n || 0);

export const numeroPresupuesto = (n: number) => `P-${String(n).padStart(5, "0")}`;

export const fechaAR = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

export function venceEl(fecha: string, dias: number) {
  const d = new Date(fecha + "T12:00:00");
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Calculadora de volumen de hormigón (m³) con % de desperdicio. */
export function volumen(largo: number, ancho: number, espesorCm: number, desperdicioPct = 5) {
  const v = (largo || 0) * (ancho || 0) * ((espesorCm || 0) / 100);
  return Math.ceil(v * (1 + desperdicioPct / 100) * 2) / 2; // redondeo a 0,5 m³
}

export const CARGA_MINIMA_M3 = 6;

/** Normaliza un teléfono argentino para wa.me (549 + área + número). */
export function telefonoWhatsApp(tel: string) {
  let d = tel.replace(/\D/g, "");
  if (!d) return "";
  d = d.replace(/^00/, "");
  if (d.startsWith("549")) return d;
  if (d.startsWith("54")) return "549" + d.slice(2);
  d = d.replace(/^0/, "");
  // 10 dígitos = área + número. Si vino con el "15" del celular (12 dígitos), se quita.
  if (d.length === 12) {
    const m = d.match(/^(\d{2,4})15(\d+)$/);
    if (m && m[1].length + m[2].length === 10) d = m[1] + m[2];
  }
  return "549" + d;
}
