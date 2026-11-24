import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Navegacion } from "@/components/Navegacion";

export const dynamic = "force-dynamic";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: perfil } = await supabase.from("perfiles").select("nombre, rol, activo").eq("id", data.user.id).single();

  if (perfil && !perfil.activo) {
    await supabase.auth.signOut();
    redirect("/login?inactivo=1");
  }

  return (
    <div className="min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <Navegacion nombre={perfil?.nombre ?? data.user.email ?? ""} esAdmin={perfil?.rol === "admin"} />
      <main className="mx-auto max-w-6xl px-4 py-5">{children}</main>
    </div>
  );
}
