import Link from "next/link";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { BotonImprimir } from "@/components/BotonImprimir";
import { discriminaIva, fechaAR, importe, numeroPresupuesto, pesos, totales, venceEl } from "@/lib/calculos";
import { NOMBRE_CONDICION, NOMBRE_UNIDAD, type CondicionFiscal, type Item, type Presupuesto, type UnidadNegocio } from "@/lib/tipos";

export const dynamic = "force-dynamic";

/** Empresas que respaldan a OBRAX Group, una por unidad de negocio. */
const RESPALDO: Record<UnidadNegocio, { nombre: string; logo: string; ancho: number; alto: number }> = {
  hormigon: { nombre: "Hormaco", logo: "/logos/hormaco.png", ancho: 429, alto: 89 },
  materiales: { nombre: "Palermo Materiales", logo: "/logos/palermo-materiales.png", ancho: 199, alto: 61 },
};

type Datos = {
  presupuesto: Presupuesto;
  cliente: { nombre: string; cuit: string; condicion_fiscal: CondicionFiscal; telefono: string } | null;
  obra: { nombre: string; direccion: string; localidad: string } | null;
  vendedor: { nombre: string; telefono: string } | null;
  items: Item[];
};

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  void token;
  return { title: "Presupuesto OBRAX", robots: { index: false } };
}

export default async function PresupuestoPublico({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ volver?: string }>;
}) {
  const { token } = await params;
  const { volver } = await searchParams;
  // Solo se acepta volver a un presupuesto de la app (evita redirecciones a otros sitios).
  const volverA = volver && /^\/presupuestos\/[0-9a-f-]{36}$/i.test(volver) ? volver : null;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();
  const supabase = await crearClienteServidor();
  const { data } = await supabase.rpc("presupuesto_publico", { p_token: token });
  if (!data) notFound();
  const { presupuesto: p, cliente, obra, vendedor, items } = data as Datos;
  const t = totales(items, p.descuento);
  const conIva = discriminaIva(cliente?.condicion_fiscal);
  const unidades = (["hormigon", "materiales"] as UnidadNegocio[]).filter((u) => items.some((i) => i.unidad_negocio === u));

  return (
    <div className="min-h-screen bg-stone-200 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] print:bg-white print:py-0">
      <div className={`no-imprimir mx-auto mb-4 flex max-w-[210mm] gap-2 px-4 ${volverA ? "justify-between" : "justify-end"}`}>
        {volverA && <Link href={volverA} className="btn-secundario">← Volver al presupuesto</Link>}
        <BotonImprimir />
      </div>

      <article className="mx-auto max-w-[210mm] bg-white shadow-lg print:shadow-none">
        <header className="relative overflow-hidden bg-white px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
          <div className="absolute right-0 top-0 h-full w-20 translate-x-10 -skew-x-12 bg-grafito sm:w-40 sm:translate-x-16 print:w-40 print:translate-x-16" />
          <div className="absolute right-12 top-0 h-full w-3 -skew-x-12 bg-naranja sm:right-24 sm:w-6 print:right-24 print:w-6" />
          <div className="relative">
            <Logo className="h-9 sm:h-12 print:h-12" />
            <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-stone-500 sm:text-[10px] sm:tracking-[0.3em] print:text-[10px] print:tracking-[0.3em]">Soluciones para la construcción</p>
          </div>
        </header>
        <div className="flex items-center justify-between gap-3 bg-grafito px-5 py-2 text-[10px] uppercase tracking-[0.15em] text-white sm:px-8 sm:text-xs sm:tracking-[0.25em] print:px-8 print:text-xs print:tracking-[0.25em]">
          <span className="hidden sm:inline print:inline">Hormigón elaborado · Materiales</span>
          <span className="font-bold text-naranja">Presupuesto {numeroPresupuesto(p.numero)}</span>
        </div>

        <section className="grid grid-cols-2 gap-6 px-5 py-6 text-sm sm:px-8 print:px-8">
          <div>
            <div className="label">Cliente</div>
            <div className="font-semibold">{cliente?.nombre ?? "—"}</div>
            {cliente?.cuit && <div>CUIT/DNI: {cliente.cuit}</div>}
            {cliente && <div>{NOMBRE_CONDICION[cliente.condicion_fiscal]}</div>}
            {obra && (<>
              <div className="label mt-3">Obra</div>
              <div className="font-semibold">{obra.nombre}</div>
              <div>{[obra.direccion, obra.localidad].filter(Boolean).join(", ")}</div>
            </>)}
          </div>
          <div className="text-right">
            <div className="label">Fecha</div>
            <div>{fechaAR(p.fecha)}</div>
            <div className="label mt-3">Válido hasta</div>
            <div className="font-semibold">{fechaAR(venceEl(p.fecha, p.vigencia_dias))}</div>
            {p.es_acopio && <div className="mt-3 inline-block rounded bg-naranja-claro px-2 py-1 text-xs font-bold text-naranja-oscuro">ACOPIO</div>}
          </div>
        </section>

        {unidades.map((u) => {
          const propios = items.filter((i) => i.unidad_negocio === u);
          return (
            <section key={u} className="px-5 pb-4 sm:px-8 print:px-8">
              <h2 className={`mb-1 flex items-end justify-between gap-3 border-b-2 pb-1 text-sm font-bold uppercase tracking-wider ${u === "hormigon" ? "border-grafito" : "border-naranja"}`}>
                <span>{NOMBRE_UNIDAD[u]}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={RESPALDO[u].logo} alt={RESPALDO[u].nombre} width={RESPALDO[u].ancho} height={RESPALDO[u].alto}
                  className="h-auto max-h-6 w-auto object-contain" />
              </h2>
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase text-stone-500">
                  <tr><th className="py-1">Descripción</th><th className="text-right">Cant.</th><th className="pl-2">Un.</th><th className="text-right">Precio unit.</th><th className="text-right">Importe</th></tr>
                </thead>
                <tbody>
                  {propios.map((i) => (
                    <tr key={i.id} className="border-b border-stone-100">
                      <td className="py-1.5">{i.descripcion}</td>
                      <td className="text-right">{Number(i.cantidad).toLocaleString("es-AR")}</td>
                      <td className="pl-2 text-stone-500">{i.unidad}</td>
                      <td className="text-right">{pesos(i.precio)}</td>
                      <td className="text-right font-medium">{pesos(importe(i))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}

        <section className="flex justify-end px-5 py-4 sm:px-8 print:px-8">
          <div className="w-72 space-y-1 text-sm">
            {t.descuento > 0 && (<>
              <Linea l="Subtotal" v={pesos(t.bruto)} />
              <Linea l={`Descuento ${p.descuento}%`} v={`− ${pesos(t.descuento)}`} />
            </>)}
            {conIva && (<>
              <Linea l="Neto gravado" v={pesos(t.neto)} />
              <Linea l="IVA" v={pesos(t.iva)} />
            </>)}
            <div className="mt-2 flex justify-between bg-grafito px-3 py-2 text-base font-bold text-white">
              <span>TOTAL</span><span>{pesos(t.total)}</span>
            </div>
            <p className="text-right text-[11px] text-stone-500">Precios en pesos argentinos, IVA incluido.</p>
          </div>
        </section>

        <section className="space-y-1 px-5 pb-6 text-xs text-stone-600 sm:px-8 print:px-8">
          {p.notas && <p className="whitespace-pre-line">{p.notas}</p>}
          {p.es_acopio && (
            <p>Acopio: precios congelados por el plazo acordado; vencido el mismo se actualizan por índice CAC. El hierro no se acopia y se cobra a precio de lista vigente.</p>
          )}
          <p>Pedidos con 48/72 horas de anticipación. Precios sujetos a disponibilidad de stock.</p>
        </section>

        <section className="mx-5 mb-6 flex sm:mx-8 print:mx-8 flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-lg border border-stone-200 px-4 py-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">Con el respaldo de</span>
          {(["hormigon", "materiales"] as UnidadNegocio[]).map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={RESPALDO[u].logo} alt={RESPALDO[u].nombre} width={RESPALDO[u].ancho} height={RESPALDO[u].alto}
              className="h-auto max-h-9 w-auto max-w-[12rem] object-contain" />
          ))}
        </section>

        <footer className="flex flex-col gap-1 border-t-4 border-naranja bg-grafito px-5 py-3 text-xs text-stone-300 sm:flex-row sm:items-center sm:justify-between sm:px-8 print:flex-row print:items-center print:justify-between print:px-8">
          <span>{vendedor?.nombre ? `Atendido por ${vendedor.nombre}${vendedor.telefono ? " · " + vendedor.telefono : ""}` : "OBRAX"}</span>
          <span className="whitespace-nowrap text-[10px] tracking-[0.2em] sm:text-xs sm:tracking-[0.25em]">SOLIDEZ | CONFIANZA | RESPALDO</span>
        </footer>
      </article>
    </div>
  );
}

function Linea({ l, v }: { l: string; v: string }) {
  return <div className="flex justify-between"><span className="text-stone-500">{l}</span><span>{v}</span></div>;
}
