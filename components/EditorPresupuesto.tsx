"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { Spinner } from "./Spinner";
import { iniciarCarga } from "./BarraCarga";
import {
  CARGA_MINIMA_M3, discriminaIva, importe, numeroPresupuesto, pesos, telefonoWhatsApp, totales, volumen, fechaAR, venceEl,
} from "@/lib/calculos";
import {
  NOMBRE_UNIDAD, type Cliente, type EstadoPresupuesto, type Item, type Obra, type Presupuesto, type Producto, type UnidadNegocio,
} from "@/lib/tipos";

type Props = { inicial: Presupuesto; itemsIniciales: Item[]; clientes: Cliente[]; obras: Obra[]; productos: Producto[] };

const nuevoId = () => crypto.randomUUID();

/** Categorías de materiales que se sugieren a quien compra hormigón (venta cruzada). */
const SUGERENCIAS_CRUZADAS = ["cemento", "aridos", "ladrillos", "cal", "impermeabilizantes"];

export function EditorPresupuesto({ inicial, itemsIniciales, clientes: clientesIni, obras: obrasIni, productos }: Props) {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const router = useRouter();
  const [p, setP] = useState(inicial);
  const [items, setItems] = useState<Item[]>(itemsIniciales);
  const [clientes, setClientes] = useState(clientesIni);
  const [obras, setObras] = useState(obrasIni);
  const [estadoGuardado, setEstadoGuardado] = useState<"" | "guardando" | "ok" | "error">("");
  const [sucio, setSucio] = useState(false);
  const [accion, setAccion] = useState<"" | "pdf" | "whatsapp" | "eliminar" | "duplicar" | "cliente" | "obra">("");
  /** Ejecuta una acción mostrando el estado de espera en su botón. */
  async function conEspera(nombre: typeof accion, fn: () => Promise<unknown>) {
    if (accion) return;
    setAccion(nombre);
    try { await fn(); } finally { setAccion(""); }
  }

  const cliente = clientes.find((c) => c.id === p.cliente_id);
  const obrasCliente = obras.filter((o) => o.cliente_id === p.cliente_id);
  const t = totales(items, p.descuento);
  const m3 = items.filter((i) => i.unidad_negocio === "hormigon" && productos.find((x) => x.id === i.producto_id)?.categoria === "hormigon")
    .reduce((s, i) => s + Number(i.cantidad || 0), 0);
  const tieneFaltante = items.some((i) => productos.find((x) => x.id === i.producto_id)?.codigo === "FALTANTE");
  const noAcopiables = p.es_acopio ? items.filter((i) => productos.find((x) => x.id === i.producto_id)?.acopiable === false) : [];

  const cambiar = <K extends keyof Presupuesto>(k: K, v: Presupuesto[K]) => { setP({ ...p, [k]: v }); setSucio(true); };
  const cambiarItems = (nuevos: Item[]) => { setItems(nuevos); setSucio(true); };

  function agregarProducto(prod: Producto, cantidad = 1) {
    cambiarItems([...items, {
      id: nuevoId(), producto_id: prod.id, unidad_negocio: prod.unidad_negocio, descripcion: prod.descripcion,
      unidad: prod.unidad, cantidad, precio: Number(prod.precio), iva: Number(prod.iva), orden: items.length,
    }]);
  }

  function agregarLibre(u: UnidadNegocio) {
    cambiarItems([...items, { id: nuevoId(), producto_id: null, unidad_negocio: u, descripcion: "", unidad: "u", cantidad: 1, precio: 0, iva: 21, orden: items.length }]);
  }

  async function guardar(extra: Partial<Presupuesto> = {}) {
    setEstadoGuardado("guardando");
    const datos = { ...p, ...extra };
    const { id, numero: _n, token: _t, actualizado: _a, ...resto } = datos;
    const r1 = await supabase.from("presupuestos").update({ ...resto, actualizado: new Date().toISOString() }).eq("id", id);
    const r2 = await supabase.from("presupuesto_items").delete().eq("presupuesto_id", id);
    const filas = items.map((i, idx) => ({ ...i, presupuesto_id: id, orden: idx }));
    const r3 = filas.length ? await supabase.from("presupuesto_items").insert(filas) : { error: null };
    const error = r1.error || r2.error || r3.error;
    setEstadoGuardado(error ? "error" : "ok");
    if (!error) { setP(datos); setSucio(false); }
    setTimeout(() => setEstadoGuardado(""), 2000);
    return !error;
  }

  async function crearCliente() {
    const nombre = prompt("Nombre del cliente");
    if (!nombre) return;
    const telefono = prompt("Teléfono / WhatsApp (opcional)") ?? "";
    const { data } = await supabase.from("clientes").insert({ nombre, telefono }).select().single();
    if (data) { setClientes([...clientes, data as Cliente]); cambiar("cliente_id", data.id); }
  }

  async function crearObra() {
    if (!p.cliente_id) return;
    const nombre = prompt("Nombre de la obra");
    if (!nombre) return;
    const direccion = prompt("Dirección de la obra") ?? "";
    const { data } = await supabase.from("obras").insert({ cliente_id: p.cliente_id, nombre, direccion }).select().single();
    if (data) { setObras([...obras, data as Obra]); setP({ ...p, obra_id: data.id }); setSucio(true); }
  }


  const linkPdf = typeof window !== "undefined" ? `${window.location.origin}/p/${p.token}/pdf` : `/p/${p.token}/pdf`;
  /** PDF listo para compartir cuando el navegador pidió un segundo toque (iPhone). */
  const [pdfParaCompartir, setPdfParaCompartir] = useState<File | null>(null);

  function textoWhatsApp(conLink: boolean) {
    return (
      `Hola${cliente ? " " + cliente.nombre.split(" ")[0] : ""}! Te envío el presupuesto ${numeroPresupuesto(p.numero)} de OBRAX` +
      `${t.hormigon > 0 && t.materiales > 0 ? " (hormigón + materiales)" : ""} por un total de ${pesos(t.total)}.` +
      (conLink ? `\n\nPresupuesto en PDF: ${linkPdf}` : "") +
      `\n\nVálido hasta el ${fechaAR(venceEl(p.fecha, p.vigencia_dias))}.`
    );
  }

  async function compartirArchivo(archivo: File) {
    try {
      await navigator.share({ files: [archivo], text: textoWhatsApp(false), title: archivo.name });
      setPdfParaCompartir(null);
    } catch (e) {
      const nombre = (e as Error).name;
      if (nombre === "NotAllowedError") setPdfParaCompartir(archivo); // pide un toque más
      else if (nombre !== "AbortError") abrirChatConLink(); // falló: mandamos el link al PDF
    }
  }

  function abrirChatConLink() {
    const tel = telefonoWhatsApp(cliente?.telefono ?? "");
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(textoWhatsApp(true))}`, "_blank");
  }

  async function enviarWhatsApp() {
    const ok = await guardar(p.estado === "borrador" ? { estado: "enviado" } : {});
    if (!ok) return;
    // Celular: compartir el PDF como archivo (se elige WhatsApp y el contacto).
    const puedeArchivos = typeof navigator !== "undefined" && "canShare" in navigator &&
      navigator.canShare({ files: [new File([""], "x.pdf", { type: "application/pdf" })] });
    if (puedeArchivos) {
      try {
        const r = await fetch(`/p/${p.token}/pdf`);
        if (!r.ok) throw new Error("pdf");
        const archivo = new File([await r.blob()], `Presupuesto-${numeroPresupuesto(p.numero)}-OBRAX.pdf`, { type: "application/pdf" });
        await compartirArchivo(archivo);
        return;
      } catch {
        /* sigue con el link */
      }
    }
    // Computadora (o sin soporte): chat de WhatsApp con el link directo al PDF.
    abrirChatConLink();
  }

  async function verPdf() {
    if (sucio && !(await guardar())) return;
    // Misma pantalla (no pestaña nueva) para poder volver, sobre todo con la app instalada.
    iniciarCarga();
    router.push(`/p/${p.token}?volver=${encodeURIComponent(`/presupuestos/${p.id}`)}`);
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar el presupuesto ${numeroPresupuesto(p.numero)}?`)) return;
    await supabase.from("presupuestos").delete().eq("id", p.id);
    iniciarCarga();
    router.replace("/presupuestos");
    router.refresh();
  }

  async function duplicar() {
    const { data } = await supabase.from("presupuestos").insert({
      cliente_id: p.cliente_id, obra_id: p.obra_id, descuento: p.descuento, notas: p.notas, es_acopio: p.es_acopio, vigencia_dias: p.vigencia_dias,
    }).select().single();
    if (!data) return;
    if (items.length) {
      await supabase.from("presupuesto_items").insert(items.map(({ id: _i, presupuesto_id: _p, ...i }, idx) => ({ ...i, presupuesto_id: data.id, orden: idx })));
    }
    iniciarCarga();
    router.push(`/presupuestos/${data.id}`);
  }

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/presupuestos" className="text-sm text-stone-500 hover:text-grafito">← Presupuestos</Link>
        <h1 className="titulo mr-auto">Presupuesto {numeroPresupuesto(p.numero)}</h1>
        <span className="text-sm">
          {estadoGuardado === "guardando" && <span className="text-stone-500">Guardando…</span>}
          {estadoGuardado === "ok" && <span className="text-green-700">Guardado ✓</span>}
          {estadoGuardado === "error" && <span className="text-red-600">Error al guardar</span>}
          {!estadoGuardado && sucio && <span className="text-amber-600">Cambios sin guardar</span>}
        </span>
        <button className="btn-secundario" onClick={() => conEspera("pdf", verPdf)} disabled={!!accion}>
          {accion === "pdf" && <Spinner />} Ver / PDF
        </button>
        <button className="btn-whatsapp" onClick={() => conEspera("whatsapp", enviarWhatsApp)} disabled={!cliente?.telefono || !!accion} title={cliente?.telefono ? "" : "El cliente no tiene teléfono"}>
          {accion === "whatsapp" && <Spinner />}
          WhatsApp
        </button>
        <button className="btn-primario min-w-[7rem]" onClick={() => guardar()} disabled={estadoGuardado === "guardando"}>
          {estadoGuardado === "guardando" ? <><Spinner /> Guardando…</> : "Guardar"}
        </button>
        <button className="btn-secundario text-red-600 hover:bg-red-50" onClick={() => conEspera("eliminar", eliminar)} disabled={!!accion} title="Eliminar presupuesto">
          {accion === "eliminar" ? <Spinner /> : "🗑"}
        </button>
      </div>

      {pdfParaCompartir && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm">
          <span className="flex-1">El PDF está listo. Tocá el botón para elegir WhatsApp y el contacto.</span>
          <button className="btn-whatsapp" onClick={() => compartirArchivo(pdfParaCompartir)}>Enviar PDF</button>
          <button className="text-stone-500" onClick={() => setPdfParaCompartir(null)}>Cancelar</button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-4 lg:col-span-2">
          {/* Cliente y obra */}
          <div className="tarjeta grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Cliente</label>
              <div className="flex gap-2">
                <select className="input" value={p.cliente_id ?? ""} onChange={(e) => { setP({ ...p, cliente_id: e.target.value || null, obra_id: null }); setSucio(true); }}>
                  <option value="">— Elegir cliente —</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <button className="btn-secundario px-3" onClick={() => conEspera("cliente", crearCliente)} disabled={!!accion} title="Nuevo cliente">{accion === "cliente" ? <Spinner /> : "+"}</button>
              </div>
              {cliente && (
                <p className="mt-1 text-xs text-stone-500">
                  {cliente.telefono || "Sin teléfono"} · {discriminaIva(cliente.condicion_fiscal) ? "Factura A (IVA discriminado)" : "Factura B"}
                  {" · "}<Link href={`/clientes/${cliente.id}`} className="text-naranja hover:underline">ficha</Link>
                </p>
              )}
            </div>
            <div>
              <label className="label">Obra</label>
              <div className="flex gap-2">
                <select className="input" value={p.obra_id ?? ""} onChange={(e) => cambiar("obra_id", e.target.value || null)} disabled={!p.cliente_id}>
                  <option value="">— Sin obra —</option>
                  {obrasCliente.map((o) => <option key={o.id} value={o.id}>{o.nombre}{o.direccion ? ` · ${o.direccion}` : ""}</option>)}
                </select>
                <button className="btn-secundario px-3" onClick={() => conEspera("obra", crearObra)} disabled={!p.cliente_id || !!accion} title="Nueva obra">{accion === "obra" ? <Spinner /> : "+"}</button>
              </div>
            </div>
          </div>

          {/* Sección hormigón */}
          <Seccion
            unidad="hormigon" items={items} productos={productos}
            onCambiar={cambiarItems} onAgregar={agregarProducto} onLibre={() => agregarLibre("hormigon")}
            extra={<CalculadoraVolumen
              tipos={productos.filter((x) => x.unidad_negocio === "hormigon" && x.categoria === "hormigon")}
              // Arranca con el último tipo de hormigón cargado en el presupuesto (o H21).
              tipoInicial={[...items].reverse().find((i) => productos.find((x) => x.id === i.producto_id)?.categoria === "hormigon")?.producto_id
                ?? productos.find((x) => x.codigo === "H21")?.id}
              enPresupuesto={(id) => items.some((i) => i.producto_id === id)}
              onUsar={(v, prod) => {
                // Si ese tipo ya está en el presupuesto, actualiza su cantidad; si no, lo agrega.
                const existente = items.find((i) => i.producto_id === prod.id);
                if (existente) cambiarItems(items.map((i) => (i.id === existente.id ? { ...i, cantidad: v } : i)));
                else agregarProducto(prod, v);
              }} />}
            aviso={m3 > 0 && m3 < CARGA_MINIMA_M3 && !tieneFaltante ? (
              <div className="flex flex-wrap items-center gap-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800">
                Pedido de {m3} m³: menor a la carga mínima de {CARGA_MINIMA_M3} m³.
                <button className="font-semibold underline" onClick={() => {
                  const f = productos.find((x) => x.codigo === "FALTANTE");
                  if (f) agregarProducto(f, CARGA_MINIMA_M3 - m3);
                }}>Agregar faltante de carga ({CARGA_MINIMA_M3 - m3} m³)</button>
              </div>
            ) : null}
          />

          {/* Sección materiales */}
          <Seccion
            unidad="materiales" items={items} productos={productos}
            onCambiar={cambiarItems} onAgregar={agregarProducto} onLibre={() => agregarLibre("materiales")}
            aviso={t.hormigon > 0 && t.materiales === 0 ? (
              <div className="rounded-md bg-naranja-claro p-3 text-sm">
                <div className="mb-2 font-semibold text-naranja-oscuro">💡 Venta cruzada: ¿le ofrecés materiales para esta obra?</div>
                <div className="flex flex-wrap gap-2">
                  {SUGERENCIAS_CRUZADAS.flatMap((cat) => productos.filter((x) => x.unidad_negocio === "materiales" && x.categoria === cat).slice(0, 1))
                    .map((x) => (
                      <button key={x.id} className="rounded-full bg-white px-3 py-1 text-xs shadow-sm hover:bg-stone-50" onClick={() => agregarProducto(x)}>
                        + {x.descripcion}
                      </button>
                    ))}
                </div>
              </div>
            ) : null}
          />
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          <div className="tarjeta space-y-2">
            <Fila l="Subtotal hormigón" v={pesos(items.filter((i) => i.unidad_negocio === "hormigon").reduce((s, i) => s + importe(i), 0))} />
            <Fila l="Subtotal materiales" v={pesos(items.filter((i) => i.unidad_negocio === "materiales").reduce((s, i) => s + importe(i), 0))} />
            {t.descuento > 0 && <Fila l={`Descuento ${p.descuento}%`} v={`− ${pesos(t.descuento)}`} />}
            {discriminaIva(cliente?.condicion_fiscal) && (<>
              <Fila l="Neto gravado" v={pesos(t.neto)} />
              <Fila l="IVA" v={pesos(t.iva)} />
            </>)}
            <div className="border-t border-stone-200 pt-2">
              <Fila l="TOTAL" v={pesos(t.total)} grande />
              <p className="text-right text-xs text-stone-500">IVA incluido</p>
            </div>
          </div>

          <div className="tarjeta space-y-3">
            <div>
              <label className="label">Estado</label>
              <select className="input" value={p.estado} onChange={(e) => cambiar("estado", e.target.value as EstadoPresupuesto)}>
                {["borrador", "enviado", "aceptado", "perdido"].map((e) => <option key={e} value={e}>{e[0].toUpperCase() + e.slice(1)}</option>)}
              </select>
            </div>
            {p.estado === "perdido" && (
              <div>
                <label className="label">Motivo de pérdida</label>
                <select className="input" value={p.motivo_perdida} onChange={(e) => cambiar("motivo_perdida", e.target.value)}>
                  <option value="">— Elegir —</option>
                  {["Precio", "Plazo de entrega", "Eligió a la competencia", "Obra postergada", "Sin respuesta", "Otro"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Fecha</label>
                <input className="input appearance-none" type="date" value={p.fecha} onChange={(e) => cambiar("fecha", e.target.value)} />
              </div>
              <div>
                <label className="label">Vigencia (días)</label>
                <input className="input" type="number" min={1} value={p.vigencia_dias} onChange={(e) => cambiar("vigencia_dias", Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Descuento %</label>
                <input className="input" type="number" min={0} max={100} step="0.5" value={p.descuento} onChange={(e) => cambiar("descuento", Number(e.target.value))} />
              </div>
              <label className="mt-6 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={p.es_acopio} onChange={(e) => cambiar("es_acopio", e.target.checked)} /> Acopio
              </label>
            </div>
            {noAcopiables.length > 0 && (
              <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">
                No acopiables (se cobran a precio del día): {noAcopiables.map((i) => i.descripcion).join(", ")}
              </p>
            )}
            <div>
              <label className="label">Notas y condiciones</label>
              <textarea className="input" rows={4} value={p.notas} onChange={(e) => cambiar("notas", e.target.value)}
                placeholder="Forma de pago, plazos de entrega, condiciones de descarga…" />
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <button className="inline-flex items-center gap-1 text-stone-600 hover:underline disabled:opacity-50" onClick={() => conEspera("duplicar", duplicar)} disabled={!!accion}>
              {accion === "duplicar" && <Spinner className="h-3.5 w-3.5" />} {accion === "duplicar" ? "Duplicando…" : "Duplicar"}
            </button>
            <button className="inline-flex items-center gap-1 text-red-600 hover:underline disabled:opacity-50" onClick={() => conEspera("eliminar", eliminar)} disabled={!!accion}>
              {accion === "eliminar" && <Spinner className="h-3.5 w-3.5" />} Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Seccion({ unidad, items, productos, onCambiar, onAgregar, onLibre, extra, aviso }: {
  unidad: UnidadNegocio; items: Item[]; productos: Producto[];
  onCambiar: (i: Item[]) => void; onAgregar: (p: Producto) => void; onLibre: () => void;
  extra?: React.ReactNode; aviso?: React.ReactNode;
}) {
  const [busqueda, setBusqueda] = useState("");
  const propios = items.filter((i) => i.unidad_negocio === unidad);
  const catalogo = productos.filter((p) => p.unidad_negocio === unidad);
  const resultados = busqueda.length >= 2
    ? catalogo.filter((p) => `${p.codigo} ${p.descripcion} ${p.categoria}`.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 8)
    : [];
  const tipos = unidad === "hormigon" ? catalogo.filter((p) => p.categoria === "hormigon") : [];

  const upd = (id: string, k: keyof Item, v: string | number) => onCambiar(items.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
  const quitar = (id: string) => onCambiar(items.filter((i) => i.id !== id));

  return (
    <div className="tarjeta space-y-3">
      <div className="flex items-center gap-2">
        <span className={`h-5 w-1.5 rounded ${unidad === "hormigon" ? "bg-grafito" : "bg-naranja"}`} />
        <h2 className="font-bold">{NOMBRE_UNIDAD[unidad]}</h2>
      </div>

      {tipos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tipos.map((x) => (
            <button key={x.id} onClick={() => onAgregar(x)} className="rounded-md border border-stone-300 px-3 py-1 text-sm font-semibold hover:border-naranja hover:text-naranja">
              + {x.codigo || x.descripcion}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <input className="input" placeholder={unidad === "hormigon" ? "Buscar bomba, aditivos, flete, recargos…" : "Buscar material: cemento, arena, ladrillo…"}
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        {resultados.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg">
            {resultados.map((r) => (
              <li key={r.id}>
                <button className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-naranja-claro" onClick={() => { onAgregar(r); setBusqueda(""); }}>
                  <span>{r.descripcion} <span className="text-xs text-stone-400">/ {r.unidad}</span></span>
                  <span className="font-semibold">{pesos(r.precio)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {extra}
      {aviso}

      {propios.length > 0 && (
        <div className="space-y-2">
          <div className="hidden grid-cols-12 gap-2 text-xs font-semibold uppercase text-stone-400 sm:grid">
            <div className="col-span-5">Descripción</div><div className="col-span-2 text-right">Cantidad</div>
            <div className="col-span-2 text-right">Precio c/IVA</div><div className="col-span-2 text-right">Importe</div><div />
          </div>
          {propios.map((i) => (
            <div key={i.id} className="grid grid-cols-12 items-center gap-2 border-b border-stone-100 pb-2 sm:border-0 sm:pb-0">
              <input className="input order-1 col-span-11 sm:col-span-5" value={i.descripcion} onChange={(e) => upd(i.id, "descripcion", e.target.value)} placeholder="Descripción" />
              <button className="order-2 col-span-1 text-stone-400 hover:text-red-600 sm:order-5" onClick={() => quitar(i.id)} title="Quitar">✕</button>
              <div className="order-3 col-span-4 flex min-w-0 items-center gap-1 sm:order-2 sm:col-span-2">
                <input className="input px-2 text-right" type="number" inputMode="decimal" step="0.5" min={0} value={i.cantidad} onChange={(e) => upd(i.id, "cantidad", Number(e.target.value))} />
                <span className="w-9 shrink-0 truncate text-xs text-stone-500">{i.unidad}</span>
              </div>
              <input className="input order-4 col-span-4 px-2 text-right sm:order-3 sm:col-span-2" type="number" inputMode="decimal" step="0.01" value={i.precio} onChange={(e) => upd(i.id, "precio", Number(e.target.value))} />
              <div className="order-5 col-span-4 truncate text-right text-sm font-semibold sm:order-4 sm:col-span-2">{pesos(importe(i))}</div>
            </div>
          ))}
        </div>
      )}
      <button className="text-sm text-stone-500 hover:text-grafito" onClick={onLibre}>+ Ítem libre</button>
    </div>
  );
}

function CalculadoraVolumen({ tipos, tipoInicial, enPresupuesto, onUsar }: {
  tipos: Producto[];
  tipoInicial?: string;
  enPresupuesto: (productoId: string) => boolean;
  onUsar: (m3: number, producto: Producto) => void;
}) {
  const [abierta, setAbierta] = useState(false);
  const [largo, setLargo] = useState(0);
  const [ancho, setAncho] = useState(0);
  const [espesor, setEspesor] = useState(12);
  const [desp, setDesp] = useState(5);
  const [tipoId, setTipoId] = useState<string | undefined>(undefined);
  const v = volumen(largo, ancho, espesor, desp);
  const tipo = tipos.find((t) => t.id === (tipoId ?? tipoInicial)) ?? tipos[0];
  const nombreTipo = (t: Producto) => t.codigo || t.descripcion;

  if (!abierta) {
    return (
      <button className="text-sm font-medium text-naranja hover:underline" onClick={() => { setTipoId(undefined); setAbierta(true); }}>
        📐 Calcular m³ (losa / platea / contrapiso)
      </button>
    );
  }
  const yaEsta = tipo ? enPresupuesto(tipo.id) : false;
  return (
    <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Num l="Largo (m)" v={largo} set={setLargo} />
        <Num l="Ancho (m)" v={ancho} set={setAncho} />
        <Num l="Espesor (cm)" v={espesor} set={setEspesor} />
        <Num l="Desperdicio %" v={desp} set={setDesp} />
      </div>
      {tipos.length > 0 && (
        <div>
          <span className="label">Tipo de hormigón</span>
          <div className="flex flex-wrap gap-1.5">
            {tipos.map((t) => (
              <button key={t.id} type="button" onClick={() => setTipoId(t.id)}
                className={`rounded-md border px-2.5 py-1 text-sm font-semibold ${t.id === tipo?.id ? "border-naranja bg-naranja text-white" : "border-stone-300 bg-white"}`}>
                {nombreTipo(t)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm">Volumen: <strong>{v.toLocaleString("es-AR")} m³</strong></span>
        <div className="flex gap-2">
          <button className="btn-secundario px-3 py-1.5" onClick={() => setAbierta(false)}>Cerrar</button>
          <button className="btn-primario px-3 py-1.5" disabled={v <= 0 || !tipo}
            onClick={() => { if (tipo) { onUsar(v, tipo); setAbierta(false); } }}>
            {tipo ? `${yaEsta ? "Poner" : "Agregar"} ${v.toLocaleString("es-AR")} m³ ${yaEsta ? "en" : "de"} ${nombreTipo(tipo)}` : "Sin tipos de hormigón"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Num({ l, v, set }: { l: string; v: number; set: (n: number) => void }) {
  return <div><label className="label">{l}</label><input className="input" type="number" step="0.1" min={0} value={v || ""} onChange={(e) => set(Number(e.target.value))} /></div>;
}

function Fila({ l, v, grande }: { l: string; v: string; grande?: boolean }) {
  return (
    <div className={`flex justify-between ${grande ? "text-lg font-bold" : "text-sm"}`}>
      <span className={grande ? "" : "text-stone-500"}>{l}</span><span>{v}</span>
    </div>
  );
}
