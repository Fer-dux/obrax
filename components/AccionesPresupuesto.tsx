"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function BotonEliminarPresupuesto({ id, numero }: { id: string; numero: string }) {
  const router = useRouter();
  const [borrando, setBorrando] = useState(false);

  async function eliminar() {
    if (!confirm(`¿Eliminar el presupuesto ${numero}? Esta acción no se puede deshacer.`)) return;
    setBorrando(true);
    const { error } = await crearClienteNavegador().from("presupuestos").delete().eq("id", id);
    setBorrando(false);
    if (error) alert("No se pudo eliminar: " + error.message);
    else router.refresh();
  }

  return (
    <button onClick={eliminar} disabled={borrando} title="Eliminar presupuesto"
      className="rounded px-2 py-1 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
      {borrando ? "…" : "🗑"}
    </button>
  );
}

export function BotonLimpiarBorradores({ ids }: { ids: string[] }) {
  const router = useRouter();
  const [borrando, setBorrando] = useState(false);
  if (ids.length === 0) return null;

  async function limpiar() {
    if (!confirm(`¿Eliminar ${ids.length} borrador(es) vacío(s) (sin cliente ni ítems)?`)) return;
    setBorrando(true);
    const { error } = await crearClienteNavegador().from("presupuestos").delete().in("id", ids);
    setBorrando(false);
    if (error) alert("No se pudo eliminar: " + error.message);
    else router.refresh();
  }

  return (
    <button className="btn-secundario" onClick={limpiar} disabled={borrando}>
      {borrando ? "Eliminando…" : `🗑 Borrar ${ids.length} borrador(es) vacío(s)`}
    </button>
  );
}
