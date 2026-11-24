import type { EstadoPresupuesto } from "@/lib/tipos";

const ESTILOS: Record<EstadoPresupuesto, string> = {
  borrador: "bg-stone-100 text-stone-700",
  enviado: "bg-blue-100 text-blue-700",
  aceptado: "bg-green-100 text-green-700",
  perdido: "bg-red-100 text-red-700",
};

export function EstadoBadge({ estado }: { estado: EstadoPresupuesto }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${ESTILOS[estado]}`}>{estado}</span>;
}
