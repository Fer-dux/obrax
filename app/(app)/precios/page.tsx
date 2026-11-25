"use client";
import { useEffect, useMemo, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { NOMBRE_UNIDAD, type Producto, type UnidadNegocio } from "@/lib/tipos";
import { pesos, fechaAR } from "@/lib/calculos";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { Spinner } from "@/components/Spinner";

export default function Precios() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const [unidad, setUnidad] = useState<UnidadNegocio>("hormigon");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [esAdmin, setEsAdmin] = useState(false);
  const [q, setQ] = useState("");
  const [pct, setPct] = useState("");
  const [msg, setMsg] = useState("");
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [aplicando, setAplicando] = useState(false);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const { data } = await supabase.from("productos").select("*").eq("unidad_negocio", unidad).order("categoria").order("descripcion");
    setProductos((data as Producto[]) ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("perfiles").select("rol").eq("id", data.user.id).single();
      setEsAdmin(p?.rol === "admin");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidad]);

  const filtrados = productos.filter((p) => `${p.codigo} ${p.descripcion} ${p.categoria}`.toLowerCase().includes(q.toLowerCase()));

  async function guardar(p: Producto) {
    setGuardandoId(p.id);
    const { id, actualizado: _a, ...resto } = p;
    const { error } = await supabase.from("productos").update({ ...resto, actualizado: new Date().toISOString() }).eq("id", id);
    setGuardandoId(null);
    aviso(error ? "No se pudo guardar (¿sos admin?)" : "Precio guardado ✓");
  }

  async function agregar() {
    const { data, error } = await supabase.from("productos")
      .insert({ unidad_negocio: unidad, descripcion: "Nuevo producto", categoria: unidad === "hormigon" ? "hormigon" : "general" })
      .select().single();
    if (error) return aviso("Solo un administrador puede agregar productos");
    setProductos([data as Producto, ...productos]);
  }

  async function aumentoMasivo() {
    const n = parseFloat(pct.replace(",", "."));
    if (!Number.isFinite(n) || n === 0) return;
    if (!confirm(`¿Aplicar ${n > 0 ? "+" : ""}${n}% a todos los precios de ${NOMBRE_UNIDAD[unidad]}?`)) return;
    setAplicando(true);
    const { data, error } = await supabase.rpc("actualizar_precios", { p_unidad: unidad, p_porcentaje: n, p_categoria: null });
    setAplicando(false);
    aviso(error ? error.message : `${data} precios actualizados ✓`);
    setPct("");
    cargar();
  }

  function aviso(t: string) {
    setMsg(t);
    setTimeout(() => setMsg(""), 2500);
  }

  const upd = (id: string, k: keyof Producto, v: string | number | boolean) =>
    setProductos(productos.map((p) => (p.id === id ? { ...p, [k]: v } : p)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="titulo flex-1">Listas de precios</h1>
        <span className="text-sm text-green-700">{msg}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["hormigon", "materiales"] as UnidadNegocio[]).map((u) => (
          <button key={u} onClick={() => setUnidad(u)} className={u === unidad ? "btn-primario" : "btn-secundario"}>
            {NOMBRE_UNIDAD[u]}
          </button>
        ))}
        <input className="input w-full sm:ml-auto sm:w-auto sm:max-w-xs" placeholder="Buscar producto…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <p className="text-xs text-stone-500">Precios finales <strong>con IVA incluido</strong>. {!esAdmin && "Solo un administrador puede modificarlos."}</p>

      {esAdmin && (
        <div className="tarjeta flex flex-wrap items-end gap-3">
          <div className="flex flex-1 items-end gap-2">
            <div className="w-28">
              <label className="label">Aumento %</label>
              <input className="input" inputMode="decimal" value={pct} onChange={(e) => setPct(e.target.value)} placeholder="4,5" />
            </div>
            <button className="btn-secundario" onClick={aumentoMasivo} disabled={aplicando}>{aplicando ? <><Spinner /> Aplicando…</> : "Aplicar a todo"}</button>
          </div>
          <button className="btn-primario w-full sm:w-auto" onClick={agregar}>+ Producto</button>
        </div>
      )}

      {/* Celular: tarjetas */}
      <div className="space-y-2 md:hidden">
        {filtrados.map((p) => (
          <TarjetaProducto key={p.id} p={p} esAdmin={esAdmin} upd={upd} guardar={guardar} guardando={guardandoId === p.id} />
        ))}
        {cargando && <p className="flex items-center justify-center gap-2 p-6 text-sm text-stone-500"><Spinner className="h-4 w-4 text-naranja" /> Cargando precios…</p>}
        {!cargando && filtrados.length === 0 && <p className="tarjeta text-center text-sm text-stone-500">Sin productos.</p>}
      </div>

      {/* Computadora: tabla */}
      <div className="tarjeta hidden overflow-x-auto p-0 sm:p-0 md:block">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
            <tr>
              <th className="px-3 py-2">Código</th><th>Descripción</th><th>Categoría</th><th>Unidad</th>
              <th className="text-right">Precio c/IVA</th>{esAdmin && <th className="text-right">Costo</th>}<th>Acopio</th><th>Actualizado</th>{esAdmin && <th />}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtrados.map((p) =>
              esAdmin ? (
                <tr key={p.id}>
                  <td className="px-2 py-1"><input className="input w-24" value={p.codigo} onChange={(e) => upd(p.id, "codigo", e.target.value)} /></td>
                  <td className="py-1"><input className="input min-w-[16rem]" value={p.descripcion} onChange={(e) => upd(p.id, "descripcion", e.target.value)} /></td>
                  <td className="py-1"><input className="input w-32" value={p.categoria} onChange={(e) => upd(p.id, "categoria", e.target.value)} /></td>
                  <td className="py-1"><input className="input w-20" value={p.unidad} onChange={(e) => upd(p.id, "unidad", e.target.value)} /></td>
                  <td className="py-1"><input className="input w-32 text-right" type="number" step="0.01" value={p.precio} onChange={(e) => upd(p.id, "precio", Number(e.target.value))} /></td>
                  <td className="py-1"><input className="input w-28 text-right" type="number" step="0.01" value={p.costo} onChange={(e) => upd(p.id, "costo", Number(e.target.value))} /></td>
                  <td className="py-1 text-center"><input type="checkbox" checked={p.acopiable} onChange={(e) => upd(p.id, "acopiable", e.target.checked)} /></td>
                  <td className="py-1 text-xs text-stone-500">{fechaAR(p.actualizado)}</td>
                  <td className="py-1 pr-2"><button className="btn-secundario min-w-[6.5rem] px-3 py-1.5" onClick={() => guardar(p)} disabled={guardandoId === p.id}>{guardandoId === p.id ? <><Spinner /> …</> : "Guardar"}</button></td>
                </tr>
              ) : (
                <tr key={p.id}>
                  <td className="px-3 py-2 font-mono text-xs">{p.codigo}</td>
                  <td>{p.descripcion}</td>
                  <td className="capitalize text-stone-500">{p.categoria}</td>
                  <td>{p.unidad}</td>
                  <td className="text-right font-semibold">{pesos(p.precio)}</td>
                  <td className="text-center">{p.acopiable ? "Sí" : "No"}</td>
                  <td className="text-xs text-stone-500">{fechaAR(p.actualizado)}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

