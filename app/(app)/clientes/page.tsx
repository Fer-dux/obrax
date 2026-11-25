"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { Spinner } from "@/components/Spinner";
import { iniciarCarga } from "@/components/BarraCarga";
import { NOMBRE_CONDICION, type Cliente } from "@/lib/tipos";

export default function Clientes() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const router = useRouter();
  const [lista, setLista] = useState<Cliente[] | null>(null);
  const [q, setQ] = useState("");
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    supabase.from("clientes").select("*").order("nombre").then(({ data }) => setLista((data as Cliente[]) ?? []));
  }, [supabase]);

  const filtrados = (lista ?? []).filter((c) =>
    [c.nombre, c.cuit, c.telefono, c.email].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );

  async function nuevo() {
    setCreando(true);
    const { data, error } = await supabase.from("clientes").insert({ nombre: "Nuevo cliente" }).select().single();
    if (!error && data) { iniciarCarga(); router.push(`/clientes/${data.id}`); }
    else setCreando(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="titulo flex-1">Clientes</h1>
        <input className="input order-last w-full sm:order-none sm:w-auto sm:max-w-xs" placeholder="Buscar nombre, CUIT, teléfono…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primario" onClick={nuevo} disabled={creando}>{creando ? <><Spinner /> Creando…</> : "+ Cliente"}</button>
      </div>
      {lista === null && (
        <p className="flex items-center gap-2 text-sm text-stone-500 md:hidden"><Spinner className="h-4 w-4 text-naranja" /> Cargando clientes…</p>
      )}
      {/* Celular: tarjetas */}
      {lista !== null && (
        <div className="space-y-2 md:hidden">
          {filtrados.length === 0 && <p className="tarjeta text-center text-sm text-stone-500">No hay clientes cargados.</p>}
          {filtrados.map((c) => (
            <Link key={c.id} href={`/clientes/${c.id}`} className="tarjeta block p-3">
              <div className="font-semibold">{c.nombre}</div>
              <div className="text-sm text-stone-500">
                {[c.tipo, NOMBRE_CONDICION[c.condicion_fiscal], c.telefono].filter(Boolean).join(" · ")}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="tarjeta hidden overflow-x-auto p-0 sm:p-0 md:block">
        {lista === null ? (
          <p className="flex items-center gap-2 p-6 text-sm text-stone-500"><Spinner className="h-4 w-4 text-naranja" /> Cargando…</p>
        ) : filtrados.length === 0 ? (
          <p className="p-6 text-center text-sm text-stone-500">No hay clientes cargados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
              <tr><th className="px-4 py-2">Nombre</th><th>Tipo</th><th>Condición</th><th>Teléfono</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtrados.map((c) => (
                <tr key={c.id} className="cursor-pointer hover:bg-stone-50" onClick={() => router.push(`/clientes/${c.id}`)}>
                  <td className="px-4 py-2.5 font-medium"><Link href={`/clientes/${c.id}`}>{c.nombre}</Link></td>
                  <td className="capitalize">{c.tipo}</td>
                  <td>{NOMBRE_CONDICION[c.condicion_fiscal]}</td>
                  <td>{c.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
