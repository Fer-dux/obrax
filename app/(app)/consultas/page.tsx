"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { telefonoWhatsApp } from "@/lib/calculos";
import { NOMBRE_ESTADO_CONSULTA, type Consulta, type EstadoConsulta } from "@/lib/tipos";
import { Spinner } from "@/components/Spinner";
import { iniciarCarga } from "@/components/BarraCarga";

type Fila = Consulta & { perfiles: { nombre: string } | null };
const FILTROS: (EstadoConsulta | "abiertas" | "todas")[] = ["abiertas", "nueva", "en_curso", "presupuestada", "descartada", "todas"];
const NOMBRE_FILTRO: Record<string, string> = { abiertas: "Pendientes", todas: "Todas", ...NOMBRE_ESTADO_CONSULTA };

const ESTILO_ESTADO: Record<EstadoConsulta, string> = {
  nueva: "bg-naranja text-white",
  en_curso: "bg-blue-100 text-blue-700",
  presupuestada: "bg-green-100 text-green-700",
  descartada: "bg-stone-100 text-stone-500",
};

function haceCuanto(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
}

export default function Consultas() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const router = useRouter();
  const [lista, setLista] = useState<Fila[] | null>(null);
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("abiertas");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [yo, setYo] = useState<string | null>(null);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    const { data } = await supabase.from("consultas").select("*, perfiles(nombre)").order("creado", { ascending: false }).limit(300);
    setLista((data as Fila[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    cargar();
    supabase.auth.getUser().then(({ data }) => setYo(data.user?.id ?? null));
    // Se actualiza sola si entra una consulta nueva mientras está abierta.
    const t = setInterval(cargar, 60000);
    return () => clearInterval(t);
  }, [cargar, supabase]);

  const visibles = (lista ?? []).filter((c) =>
    filtro === "todas" ? true : filtro === "abiertas" ? c.estado === "nueva" || c.estado === "en_curso" : c.estado === filtro,
  );
  const cuenta = (f: (typeof FILTROS)[number]) =>
    (lista ?? []).filter((c) => (f === "todas" ? true : f === "abiertas" ? c.estado === "nueva" || c.estado === "en_curso" : c.estado === f)).length;

  async function cambiarEstado(c: Fila, estado: EstadoConsulta) {
    setOcupado(c.id);
    setError("");
    const { error } = await supabase.from("consultas")
      .update({ estado, atendida_por: c.atendida_por ?? yo, actualizado: new Date().toISOString() }).eq("id", c.id);
    if (error) setError("No se pudo actualizar: " + error.message);
    await cargar();
    setOcupado(null);
  }

  /** Crea (o reutiliza) el cliente, la obra y un presupuesto con los datos de la consulta. */
  async function convertir(c: Fila) {
    setOcupado(c.id);
    setError("");
    try {
      let clienteId = c.cliente_id;
      if (!clienteId) {
        // ¿Ya existe un cliente con ese teléfono o email?
        const tel = c.telefono.replace(/\D/g, "").slice(-8);
        const { data: existentes } = await supabase.from("clientes").select("id, telefono, email");
        const existente = (existentes ?? []).find((x) =>
          (c.email && x.email?.toLowerCase() === c.email.toLowerCase()) ||
          (tel.length === 8 && x.telefono?.replace(/\D/g, "").endsWith(tel)));
        if (existente) clienteId = existente.id;
        else {
          const { data: nuevo, error } = await supabase.from("clientes")
            .insert({ nombre: c.nombre, telefono: c.telefono, email: c.email, notas: "Cliente desde la web" }).select("id").single();
          if (error || !nuevo) throw new Error(error?.message ?? "No se pudo crear el cliente");
          clienteId = nuevo.id;
        }
      }

      let obraId: string | null = null;
      if (c.obra) {
        const { data: obra } = await supabase.from("obras")
          .insert({ cliente_id: clienteId, nombre: c.obra.slice(0, 60), direccion: c.obra }).select("id").single();
        obraId = obra?.id ?? null;
      }

      const notas = [`Consulta web (${c.necesita}):`, c.mensaje].filter(Boolean).join("\n");
      const { data: pres, error: eP } = await supabase.from("presupuestos")
        .insert({ cliente_id: clienteId, obra_id: obraId, notas }).select("id").single();
      if (eP || !pres) throw new Error(eP?.message ?? "No se pudo crear el presupuesto");

      await supabase.from("consultas").update({
        estado: "presupuestada", atendida_por: c.atendida_por ?? yo, cliente_id: clienteId,
        presupuesto_id: pres.id, actualizado: new Date().toISOString(),
      }).eq("id", c.id);

      iniciarCarga();
      router.push(`/presupuestos/${pres.id}`);
    } catch (e) {
      setError((e as Error).message);
      setOcupado(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="titulo">Consultas de la web</h1>
        <p className="text-sm text-stone-500">Pedidos que llegan desde el formulario de obraxgroup.com.ar.</p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTROS.map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm ${filtro === f ? "bg-grafito text-white" : "bg-white text-stone-600 hover:bg-stone-50"}`}>
            {NOMBRE_FILTRO[f]} <span className="opacity-60">{lista ? cuenta(f) : ""}</span>
          </button>
        ))}
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {lista === null ? (
        <p className="flex items-center gap-2 text-sm text-stone-500"><Spinner className="h-4 w-4 text-naranja" /> Cargando consultas…</p>
      ) : visibles.length === 0 ? (
        <div className="tarjeta py-10 text-center text-sm text-stone-500">
          {filtro === "abiertas" ? "No hay consultas pendientes. 🎉" : "No hay consultas en este estado."}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visibles.map((c) => {
            const wa = c.telefono ? `https://wa.me/${telefonoWhatsApp(c.telefono)}?text=${encodeURIComponent(
              `Hola ${c.nombre.split(" ")[0]}! Te escribo de OBRAX por tu consulta en la web${c.necesita ? ` (${c.necesita.toLowerCase()})` : ""}.`)}` : null;
            const trabajando = ocupado === c.id;
            return (
              <div key={c.id} className={`tarjeta flex flex-col gap-3 ${c.estado === "nueva" ? "border-l-4 border-l-naranja" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-bold">{c.nombre}</div>
                    <div className="text-xs text-stone-500">
                      {haceCuanto(c.creado)} · {new Date(c.creado).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ESTILO_ESTADO[c.estado]}`}>{NOMBRE_ESTADO_CONSULTA[c.estado]}</span>
                    {c.necesita && <span className="text-xs font-semibold text-stone-600">{c.necesita}</span>}
                  </div>
                </div>

                {c.mensaje && <p className="whitespace-pre-line rounded-md bg-stone-50 p-3 text-sm">{c.mensaje}</p>}

                <dl className="grid gap-1 text-sm">
                  {c.telefono && <div><dt className="inline text-stone-500">Tel: </dt><dd className="inline"><a href={`tel:${c.telefono}`} className="text-naranja hover:underline">{c.telefono}</a></dd></div>}
                  {c.email && <div className="truncate"><dt className="inline text-stone-500">Email: </dt><dd className="inline"><a href={`mailto:${c.email}`} className="text-naranja hover:underline">{c.email}</a></dd></div>}
                  {c.obra && <div><dt className="inline text-stone-500">Obra: </dt><dd className="inline">{c.obra}</dd></div>}
                  {c.perfiles?.nombre && <div><dt className="inline text-stone-500">Atiende: </dt><dd className="inline">{c.perfiles.nombre}</dd></div>}
                </dl>

                <div className="mt-auto flex flex-wrap gap-2 border-t border-stone-100 pt-3">
                  {c.presupuesto_id ? (
                    <Link href={`/presupuestos/${c.presupuesto_id}`} className="btn-primario flex-1">Ver presupuesto</Link>
                  ) : (
                    <button className="btn-primario flex-1" onClick={() => convertir(c)} disabled={trabajando || c.estado === "descartada"}>
                      {trabajando ? <><Spinner /> Creando…</> : "Hacer presupuesto"}
                    </button>
                  )}
                  {wa && <a href={wa} target="_blank" rel="noopener" className="btn-whatsapp" onClick={() => c.estado === "nueva" && cambiarEstado(c, "en_curso")}>WhatsApp</a>}
                  {c.estado === "nueva" && (
                    <button className="btn-secundario" onClick={() => cambiarEstado(c, "en_curso")} disabled={trabajando}>Tomar</button>
                  )}
                  {(c.estado === "nueva" || c.estado === "en_curso") && (
                    <button className="btn-secundario text-stone-500" onClick={() => confirm("¿Descartar esta consulta?") && cambiarEstado(c, "descartada")} disabled={trabajando}>Descartar</button>
                  )}
                  {c.estado === "descartada" && (
                    <button className="btn-secundario" onClick={() => cambiarEstado(c, "nueva")} disabled={trabajando}>Reabrir</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
