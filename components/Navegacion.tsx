"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { useState } from "react";
import { Spinner } from "./Spinner";
import { iniciarCarga } from "./BarraCarga";

const ENLACES: { href: string; texto: string; corto?: string; icono: string }[] = [
  { href: "/", texto: "Panel", icono: "▦" },
  { href: "/presupuestos", texto: "Presupuestos", corto: "Presup.", icono: "₱" },
  { href: "/consultas", texto: "Consultas", icono: "✉" },
  { href: "/clientes", texto: "Clientes", icono: "☺" },
  { href: "/precios", texto: "Precios", icono: "$" },
];

export function Navegacion({ nombre, esAdmin, consultasNuevas = 0 }: { nombre: string; esAdmin: boolean; consultasNuevas?: number }) {
  const ruta = usePathname();
  const router = useRouter();
  const activo = (h: string) => (h === "/" ? ruta === "/" : ruta.startsWith(h));
  const enlacesEscritorio = esAdmin ? [...ENLACES, { href: "/usuarios", texto: "Usuarios", icono: "👥" }] : ENLACES;
  const globo = (href: string) =>
    href === "/consultas" && consultasNuevas > 0 ? (
      <span className="ml-1 rounded-full bg-naranja px-1.5 py-px text-[10px] font-bold leading-none text-white">{consultasNuevas}</span>
    ) : null;

  const [saliendo, setSaliendo] = useState(false);
  async function salir() {
    setSaliendo(true);
    iniciarCarga();
    await crearClienteNavegador().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <header className="no-imprimir sticky top-0 z-20 bg-grafito pt-[env(safe-area-inset-top)] text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6">
          <Link href="/" className="shrink-0"><Logo className="h-6 sm:h-7" claro /></Link>
          <nav className="hidden gap-1 sm:flex">
            {enlacesEscritorio.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${activo(e.href) ? "bg-naranja text-white" : "text-stone-300 hover:bg-grafito-claro"}`}
              >
                {e.texto}{globo(e.href)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm sm:gap-3">
            <span className="hidden text-stone-300 md:inline">
              {nombre}{esAdmin && <span className="ml-1 rounded bg-naranja/20 px-1.5 text-xs text-naranja">admin</span>}
            </span>
            {esAdmin && (
              <Link href="/usuarios" title="Usuarios" aria-label="Usuarios"
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm sm:hidden ${activo("/usuarios") ? "border-naranja bg-naranja" : "border-stone-500"}`}>
                👥
              </Link>
            )}
            <Link href="/ayuda" title="Ayuda" aria-label="Ayuda"
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${activo("/ayuda") ? "border-naranja bg-naranja text-white" : "border-stone-500 text-stone-300 hover:border-white hover:text-white"}`}>
              ?
            </Link>
            <Link href="/presupuestos/nuevo" prefetch={false} className="btn-primario h-8 w-8 rounded-full p-0 text-lg sm:h-auto sm:w-auto sm:rounded-md sm:px-3 sm:py-1.5 sm:text-sm" aria-label="Nuevo presupuesto" title="Nuevo presupuesto"><span className="sm:hidden">+</span><span className="hidden sm:inline">+ Presupuesto</span></Link>
            <button onClick={salir} disabled={saliendo} aria-label="Salir" title="Salir"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:text-white sm:h-auto sm:w-auto">
              {saliendo ? <Spinner /> : (
                <>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  <span className="hidden sm:inline">Salir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>
      <nav className="no-imprimir fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
        {ENLACES.map((e) => (
          <Link key={e.href} href={e.href} className={`flex min-w-0 flex-col items-center py-2 text-[11px] ${activo(e.href) ? "text-naranja" : "text-stone-500"}`}>
            <span className="relative text-lg leading-none">
              {e.icono}
              {e.href === "/consultas" && consultasNuevas > 0 && (
                <span className="absolute -right-3 -top-1.5 min-w-[1.1rem] rounded-full bg-naranja px-1 text-center text-[10px] font-bold leading-4 text-white">{consultasNuevas}</span>
              )}
            </span>
            <span className="max-w-full truncate px-0.5">{e.corto ?? e.texto}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
