import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { totales, pesos, numeroPresupuesto, fechaAR } from "@/lib/calculos";
import { EstadoBadge } from "@/components/EstadoBadge";
import type { Item, Presupuesto } from "@/lib/tipos";

type Fila = Presupuesto & { presupuesto_items: Item[]; clientes: { nombre: string } | null; perfiles: { nombre: string } | null };

export default async function Panel() {
  const supabase = await crearClienteServidor();
  const inicioMes = new Date();
  inicioMes.setDate(1);
  const desde = inicioMes.toISOString().slice(0, 10);

  const [{ data: presupuestos }, { count: clientes }] = await Promise.all([
    supabase
      .from("presupuestos")
      .select("*, presupuesto_items(*), clientes(nombre), perfiles(nombre)")
      .gte("fecha", desde)
      .order("actualizado", { ascending: false }),
    supabase.from("clientes").select("id", { count: "exact", head: true }),
  ]);

  const lista = (presupuestos ?? []) as Fila[];
  const conTotales = lista.map((p) => ({ p, t: totales(p.presupuesto_items, p.descuento) }));
  const aceptados = conTotales.filter((x) => x.p.estado === "aceptado");
  const enviados = conTotales.filter((x) => x.p.estado === "enviado");
  const cerrados = conTotales.filter((x) => x.p.estado === "aceptado" || x.p.estado === "perdido").length;
  const conversion = cerrados ? Math.round((aceptados.length / cerrados) * 100) : 0;
  const sum = (xs: typeof conTotales, k: "hormigon" | "materiales" | "total") => xs.reduce((s, x) => s + x.t[k], 0);
  const cruzados = conTotales.filter((x) => x.t.hormigon > 0 && x.t.materiales > 0).length;

  const porVendedor = new Map<string, number>();
  aceptados.forEach(({ p, t }) => {
    const n = p.perfiles?.nombre ?? "Sin asignar";
    porVendedor.set(n, (porVendedor.get(n) ?? 0) + t.total);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="titulo">Panel de gestión</h1>
          <p className="text-sm text-stone-500">Mes en curso · desde {fechaAR(desde)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato titulo="Ventas hormigón" valor={pesos(sum(aceptados, "hormigon"))} acento />
        <Dato titulo="Ventas materiales" valor={pesos(sum(aceptados, "materiales"))} acento />
        <Dato titulo="Presupuestos pendientes" valor={`${enviados.length} · ${pesos(sum(enviados, "total"))}`} />
        <Dato titulo="Clientes en cartera" valor={String(clientes ?? 0)} />
        <Dato titulo="Conversión" valor={`${conversion}%`} pie="aceptados / cerrados" />
        <Dato titulo="Ventas cruzadas" valor={String(cruzados)} pie="presupuestos con hormigón + materiales" />
        <Dato titulo="Presupuestos del mes" valor={String(lista.length)} />
        <Dato titulo="Ticket promedio" valor={pesos(aceptados.length ? sum(aceptados, "total") / aceptados.length : 0)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="tarjeta lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Últimos presupuestos</h2>
            <Link href="/presupuestos" className="text-sm text-naranja hover:underline">Ver todos</Link>
          </div>
          {lista.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500">
              Todavía no hay presupuestos este mes.{" "}
              <Link href="/presupuestos/nuevo" prefetch={false} className="text-naranja hover:underline">Crear uno</Link>
            </p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {conTotales.slice(0, 8).map(({ p, t }) => (
                <li key={p.id}>
                  <Link href={`/presupuestos/${p.id}`} className="flex items-center gap-3 py-2.5 hover:bg-stone-50">
                    <span className="font-mono text-xs text-stone-500">{numeroPresupuesto(p.numero)}</span>
                    <span className="flex-1 truncate text-sm font-medium">{p.clientes?.nombre ?? "Sin cliente"}</span>
                    <EstadoBadge estado={p.estado} />
                    <span className="w-28 text-right text-sm font-semibold">{pesos(t.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="tarjeta">
          <h2 className="mb-3 font-semibold">Ventas por vendedor</h2>
          {porVendedor.size === 0 ? (
            <p className="text-sm text-stone-500">Sin ventas cerradas este mes.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {[...porVendedor.entries()].sort((a, b) => b[1] - a[1]).map(([n, v]) => (
                <li key={n} className="flex justify-between"><span>{n}</span><span className="font-semibold">{pesos(v)}</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Dato({ titulo, valor, pie, acento }: { titulo: string; valor: string; pie?: string; acento?: boolean }) {
  return (
    <div className={`tarjeta ${acento ? "border-l-4 border-l-naranja" : ""}`}>
      <div className="label">{titulo}</div>
      <div className="text-lg font-bold sm:text-xl">{valor}</div>
      {pie && <div className="mt-0.5 text-xs text-stone-400">{pie}</div>}
    </div>
  );
}
