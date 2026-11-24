import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";

export default async function NuevoPresupuesto() {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.from("presupuestos").insert({}).select("id").single();
  if (error || !data) throw new Error("No se pudo crear el presupuesto: " + (error?.message ?? ""));
  redirect(`/presupuestos/${data.id}`);
}
