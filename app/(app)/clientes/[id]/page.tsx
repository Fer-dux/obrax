"use client";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { NOMBRE_CONDICION, type Cliente, type CondicionFiscal, type Obra, type Presupuesto, type Item } from "@/lib/tipos";
import { numeroPresupuesto, pesos, totales, fechaAR } from "@/lib/calculos";
import { EstadoBadge } from "@/components/EstadoBadge";

type P = Presupuesto & { presupuesto_items: Item[] };

export default function FichaCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const router = useRouter();
  const [c, setC] = useState<Cliente | null>(null);
  const [obras, setObras] = useState<Obra[]>([]);
  const [presupuestos, setPresupuestos] = useState<P[]>([]);
  const [guardado, setGuardado] = useState("");

  useEffect(() => {
    supabase.from("clientes").select("*").eq("id", id).single().then(({ data }) => setC(data as Cliente));
    supabase.from("obras").select("*").eq("cliente_id", id).order("creado").then(({ data }) => setObras((data as Obra[]) ?? []));
    supabase.from("presupuestos").select("*, presupuesto_items(*)").eq("cliente_id", id).order("numero", { ascending: false })
      .then(({ data }) => setPresupuestos((data as P[]) ?? []));
  }, [id, supabase]);

  if (!c) return <p className="text-sm text-stone-500">Cargando…</p>;

  const set = (k: keyof Cliente, v: string) => setC({ ...c, [k]: v });

  async function guardar() {
    const { id: _id, creado: _c, ...resto } = c!;
    const { error } = await supabase.from("clientes").update(resto).eq("id", id);
    setGuardado(error ? "Error al guardar" : "Guardado ✓");
    setTimeout(() => setGuardado(""), 2000);
  }

  async function agregarObra() {
    const { data } = await supabase.from("obras").insert({ cliente_id: id, nombre: "Nueva obra" }).select().single();
    if (data) setObras([...obras, data as Obra]);
  }

  async function guardarObra(o: Obra) {
    await supabase.from("obras").update({ nombre: o.nombre, direccion: o.direccion, localidad: o.localidad, contacto_obra: o.contacto_obra }).eq("id", o.id);
  }

  async function borrarObra(o: Obra) {
    if (!confirm(`¿Eliminar la obra "${o.nombre}"?`)) return;
    await supabase.from("obras").delete().eq("id", o.id);
    setObras(obras.filter((x) => x.id !== o.id));
  }

  async function borrarCliente() {
    if (!confirm(`¿Eliminar a ${c!.nombre}? Sus presupuestos quedan sin cliente.`)) return;
    await supabase.from("clientes").delete().eq("id", id);
    router.replace("/clientes");
  }

  async function presupuestar(obraId?: string) {
    const { data } = await supabase.from("presupuestos").insert({ cliente_id: id, obra_id: obraId ?? null }).select().single();
    if (data) router.push(`/presupuestos/${data.id}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/clientes" className="text-sm text-stone-500 hover:text-grafito">← Clientes</Link>
        <h1 className="titulo flex-1">{c.nombre}</h1>
        <span className="text-sm text-green-700">{guardado}</span>
        <button className="btn-secundario" onClick={() => presupuestar()}>Nuevo presupuesto</button>
        <button className="btn-primario" onClick={guardar}>Guardar</button>
      </div>

      <div className="tarjeta grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Campo l="Nombre / Razón social"><input className="input" value={c.nombre} onChange={(e) => set("nombre", e.target.value)} /></Campo>
        <Campo l="Tipo">
          <select className="input" value={c.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {["particular", "arquitecto", "constructora", "corralón", "empresa", "otro"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Campo>
        <Campo l="Condición fiscal">
          <select className="input" value={c.condicion_fiscal} onChange={(e) => set("condicion_fiscal", e.target.value as CondicionFiscal)}>
            {Object.entries(NOMBRE_CONDICION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Campo>
        <Campo l="CUIT / DNI"><input className="input" value={c.cuit} onChange={(e) => set("cuit", e.target.value)} /></Campo>
        <Campo l="Teléfono (WhatsApp)"><input className="input" value={c.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="11 1234 5678" /></Campo>
        <Campo l="Email"><input className="input" type="email" value={c.email} onChange={(e) => set("email", e.target.value)} /></Campo>
        <div className="sm:col-span-2 lg:col-span-3">
          <Campo l="Notas"><textarea className="input" rows={2} value={c.notas} onChange={(e) => set("notas", e.target.value)} /></Campo>
        </div>
      </div>

      <div className="tarjeta">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Obras</h2>
          <button className="btn-secundario px-3 py-1.5" onClick={agregarObra}>+ Obra</button>
        </div>
        {obras.length === 0 && <p className="text-sm text-stone-500">Sin obras cargadas.</p>}
        <div className="space-y-3">
          {obras.map((o, idx) => {
            const upd = (k: keyof Obra, v: string) => setObras(obras.map((x, i) => (i === idx ? { ...x, [k]: v } : x)));
            return (
              <div key={o.id} className="grid gap-2 rounded-lg border border-stone-200 p-3 sm:grid-cols-4" onBlur={() => guardarObra(obras[idx])}>
                <input className="input" value={o.nombre} onChange={(e) => upd("nombre", e.target.value)} placeholder="Nombre de la obra" />
                <input className="input" value={o.direccion} onChange={(e) => upd("direccion", e.target.value)} placeholder="Dirección" />
                <input className="input" value={o.localidad} onChange={(e) => upd("localidad", e.target.value)} placeholder="Localidad" />
                <div className="flex gap-2">
                  <input className="input" value={o.contacto_obra} onChange={(e) => upd("contacto_obra", e.target.value)} placeholder="Contacto en obra" />
                  <button className="btn-secundario px-2" title="Presupuestar esta obra" onClick={() => presupuestar(o.id)}>₱</button>
                  <button className="px-2 text-red-600" title="Eliminar" onClick={() => borrarObra(o)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tarjeta">
        <h2 className="mb-3 font-semibold">Historial de presupuestos</h2>
        {presupuestos.length === 0 ? <p className="text-sm text-stone-500">Sin presupuestos.</p> : (
          <ul className="divide-y divide-stone-100 text-sm">
            {presupuestos.map((p) => (
              <li key={p.id}>
                <Link href={`/presupuestos/${p.id}`} className="flex items-center gap-3 py-2 hover:bg-stone-50">
                  <span className="font-mono text-xs">{numeroPresupuesto(p.numero)}</span>
                  <span className="text-stone-500">{fechaAR(p.fecha)}</span>
                  <span className="flex-1" />
                  <EstadoBadge estado={p.estado} />
                  <span className="w-28 text-right font-semibold">{pesos(totales(p.presupuesto_items, p.descuento).total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="text-sm text-red-600 hover:underline" onClick={borrarCliente}>Eliminar cliente</button>
    </div>
  );
}

function Campo({ l, children }: { l: string; children: React.ReactNode }) {
  return <div><label className="label">{l}</label>{children}</div>;
}
