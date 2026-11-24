"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { crearClienteNavegador } from "@/lib/supabase/client";

const ENLACES = [
  { href: "/", texto: "Panel", icono: "▦" },
  { href: "/presupuestos", texto: "Presupuestos", corto: "Presup.", icono: "₱" },
  { href: "/clientes", texto: "Clientes", icono: "☺" },
  { href: "/precios", texto: "Precios", icono: "$" },
];

export function Navegacion({ nombre, esAdmin }: { nombre: string; esAdmin: boolean }) {
  const ruta = usePathname();
  const router = useRouter();
  const activo = (h: string) => (h === "/" ? ruta === "/" : ruta.startsWith(h));
  const enlaces = esAdmin ? [...ENLACES, { href: "/usuarios", texto: "Usuarios", icono: "👥" }] : ENLACES;

  async function salir() {
    await crearClienteNavegador().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <header className="no-imprimir sticky top-0 z-20 bg-grafito pt-[env(safe-area-inset-top)] text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/"><Logo className="h-7" claro /></Link>
          <nav className="hidden gap-1 sm:flex">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${activo(e.href) ? "bg-naranja text-white" : "text-stone-300 hover:bg-grafito-claro"}`}
              >
                {e.texto}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-stone-300 md:inline">
              {nombre}{esAdmin && <span className="ml-1 rounded bg-naranja/20 px-1.5 text-xs text-naranja">admin</span>}
            </span>
            <Link href="/presupuestos/nuevo" prefetch={false} className="btn-primario px-3 py-1.5">+ Presupuesto</Link>
            <button onClick={salir} className="text-stone-400 hover:text-white">Salir</button>
          </div>
        </div>
      </header>
      <nav className={`no-imprimir fixed inset-x-0 bottom-0 z-20 grid border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden ${esAdmin ? "grid-cols-5" : "grid-cols-4"}`}>
        {enlaces.map((e) => (
          <Link key={e.href} href={e.href} className={`flex min-w-0 flex-col items-center py-2 text-[11px] ${activo(e.href) ? "text-naranja" : "text-stone-500"}`}>
            <span className="text-lg leading-none">{e.icono}</span>
            <span className="max-w-full truncate px-0.5">{"corto" in e && e.corto ? e.corto : e.texto}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
