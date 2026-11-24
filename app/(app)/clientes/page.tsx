"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { NOMBRE_CONDICION, type Cliente } from "@/lib/tipos";

export default function Clientes() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const router = useRouter();
  const [lista, setLista] = useState<Cliente[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("clientes").select("*").order("nombre").then(({ data }) => setLista((data as Cliente[]) ?? []));
  }, [supabase]);

  const filtrados = (lista ?? []).filter((c) =>
    [c.nombre, c.cuit, c.telefono, c.email].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );

  async function nuevo() {
    const { data, error } = await supabase.from("clientes").insert({ nombre: "Nuevo cliente" }).select().single();
    if (!error && data) router.push(`/clientes/${data.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="titulo flex-1">Clientes</h1>
        <input className="input max-w-xs" placeholder="Buscar nombre, CUIT, teléfono…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primario" onClick={nuevo}>+ Cliente</button>
      </div>
      <div className="tarjeta overflow-x-auto p-0 sm:p-0">
        {lista === null ? (
          <p className="p-6 text-sm text-stone-500">Cargando…</p>
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
