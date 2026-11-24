import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { EditorPresupuesto } from "@/components/EditorPresupuesto";
import type { Cliente, Item, Obra, Presupuesto, Producto } from "@/lib/tipos";

export default async function Pagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const [{ data: p }, { data: items }, { data: clientes }, { data: obras }, { data: productos }] = await Promise.all([
    supabase.from("presupuestos").select("*").eq("id", id).single(),
    supabase.from("presupuesto_items").select("*").eq("presupuesto_id", id).order("orden"),
    supabase.from("clientes").select("*").order("nombre"),
    supabase.from("obras").select("*").order("nombre"),
    supabase.from("productos").select("*").eq("activo", true).order("descripcion"),
  ]);
  if (!p) notFound();
  return (
    <EditorPresupuesto
      inicial={p as Presupuesto}
      itemsIniciales={(items ?? []) as Item[]}
      clientes={(clientes ?? []) as Cliente[]}
      obras={(obras ?? []) as Obra[]}
      productos={(productos ?? []) as Producto[]}
    />
  );
}
