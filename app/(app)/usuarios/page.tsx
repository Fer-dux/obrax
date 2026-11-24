import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { hayClaveServicio } from "@/lib/supabase/admin";
import { GestionUsuarios } from "@/components/GestionUsuarios";
import type { Perfil } from "@/lib/tipos";

export default async function Usuarios() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  const { data: yo } = await supabase.from("perfiles").select("rol").eq("id", data.user!.id).single();
  if (yo?.rol !== "admin") redirect("/");

  const { data: perfiles } = await supabase.from("perfiles").select("*").order("activo", { ascending: false }).order("nombre");

  return <GestionUsuarios usuarios={(perfiles ?? []) as Perfil[]} yoId={data.user!.id} configurado={hayClaveServicio()} />;
}
