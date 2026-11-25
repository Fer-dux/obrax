import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { totales, pesos, numeroPresupuesto, fechaAR } from "@/lib/calculos";
import { EstadoBadge } from "@/components/EstadoBadge";
import { BotonEliminarPresupuesto, BotonLimpiarBorradores } from "@/components/AccionesPresupuesto";
import type { EstadoPresupuesto, Item, Presupuesto } from "@/lib/tipos";

type Fila = Presupuesto & { presupuesto_items: Item[]; clientes: { nombre: string } | null; obras: { nombre: string } | null; perfiles: { nombre: string } | null };
const ESTADOS: (EstadoPresupuesto | "todos")[] = ["todos", "borrador", "enviado", "aceptado", "perdido"];

export default async function Presupuestos({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado = "todos" } = await searchParams;
  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from("presupuestos")
    .select("*, presupuesto_items(*), clientes(nombre), obras(nombre), perfiles(nombre)")
    .order("numero", { ascending: false })
    .limit(200);
  if (estado !== "todos") consulta = consulta.eq("estado", estado);
  const { data } = await consulta;
  const lista = (data ?? []) as Fila[];
  const vacios = lista.filter((p) => p.estado === "borrador" && !p.cliente_id && p.presupuesto_items.length === 0).map((p) => p.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="titulo flex-1">Presupuestos</h1>
        <BotonLimpiarBorradores ids={vacios} />
        <Link href="/presupuestos/nuevo" prefetch={false} className="btn-primario">+ Presupuesto</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {ESTADOS.map((e) => (
          <Link key={e} href={e === "todos" ? "/presupuestos" : `/presupuestos?estado=${e}`}
            className={`rounded-full px-3 py-1 text-sm capitalize ${estado === e ? "bg-grafito text-white" : "bg-white text-stone-600 hover:bg-stone-50"}`}>
            {e}
          </Link>
        ))}
      </div>
      {/* Celular: tarjetas */}
      <div className="space-y-2 md:hidden">
        {lista.length === 0 && <p className="tarjeta text-center text-sm text-stone-500">No hay presupuestos.</p>}
        {lista.map((p) => {
          const t = totales(p.presupuesto_items, p.descuento);
          return (
            <div key={p.id} className="tarjeta flex items-center gap-3 p-3">
              <Link href={`/presupuestos/${p.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-naranja">{numeroPresupuesto(p.numero)}</span>
                  <EstadoBadge estado={p.estado} />
                  {t.hormigon > 0 && <span className="rounded bg-grafito px-1 text-[10px] text-white">H</span>}
                  {t.materiales > 0 && <span className="rounded bg-naranja px-1 text-[10px] text-white">M</span>}
                </div>
                <div className="mt-1 truncate font-semibold">{p.clientes?.nombre ?? "Sin cliente"}</div>
                <div className="flex justify-between text-sm">
                  <span className="truncate text-stone-500">{fechaAR(p.fecha)}{p.obras?.nombre ? ` · ${p.obras.nombre}` : ""}</span>
                  <span className="shrink-0 font-bold">{pesos(t.total)}</span>
                </div>
              </Link>
              <BotonEliminarPresupuesto id={p.id} numero={numeroPresupuesto(p.numero)} />
            </div>
          );
        })}
      </div>

      <div className="tarjeta hidden overflow-x-auto p-0 sm:p-0 md:block">
        {lista.length === 0 ? (
          <p className="p-8 text-center text-sm text-stone-500">No hay presupuestos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
              <tr><th className="px-4 py-2">Número</th><th>Cliente / Obra</th><th>Fecha</th><th>Unidades</th><th>Vendedor</th><th>Estado</th><th className="text-right">Total</th><th className="w-12" /></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {lista.map((p) => {
                const t = totales(p.presupuesto_items, p.descuento);
                return (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="px-4 py-2.5 font-mono"><Link href={`/presupuestos/${p.id}`} className="text-naranja hover:underline">{numeroPresupuesto(p.numero)}</Link></td>
                    <td><div className="font-medium">{p.clientes?.nombre ?? "Sin cliente"}</div><div className="text-xs text-stone-500">{p.obras?.nombre}</div></td>
                    <td>{fechaAR(p.fecha)}</td>
                    <td className="space-x-1 text-xs">
                      {t.hormigon > 0 && <span className="rounded bg-grafito px-1.5 py-0.5 text-white">H</span>}
                      {t.materiales > 0 && <span className="rounded bg-naranja px-1.5 py-0.5 text-white">M</span>}
                      {p.es_acopio && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">Acopio</span>}
                    </td>
                    <td className="text-stone-600">{p.perfiles?.nombre}</td>
                    <td><EstadoBadge estado={p.estado} /></td>
                    <td className="text-right font-semibold">{pesos(t.total)}</td>
                    <td className="pr-2 text-right"><BotonEliminarPresupuesto id={p.id} numero={numeroPresupuesto(p.numero)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
