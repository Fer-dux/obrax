"use client";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Cerrar, Menu, Mensaje } from "./Iconos";

const ENLACES = [
  { href: "#inicio", texto: "Inicio" },
  { href: "#grupo", texto: "Grupo" },
  { href: "#hormigon", texto: "Hormigón" },
  { href: "#materiales", texto: "Materiales" },
  { href: "#calculadora", texto: "Calculadora" },
  { href: "#contacto", texto: "Contacto" },
];

export function Encabezado({ appHref }: { appHref: string }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-carbon/95 backdrop-blur">
      <div className="contenedor flex h-16 items-center gap-4 lg:h-[72px]">
        <a href="#inicio" className="flex shrink-0 items-center gap-4" aria-label="OBRAX Group, inicio">
          <Logo className="h-7 lg:h-8" claro />
          <span className="hidden border-l border-white/15 pl-4 text-xs leading-tight text-stone-300 xl:block">
            Soluciones integrales<br />para la construcción
          </span>
        </a>

        <nav aria-label="Principal" className="ml-auto hidden items-center gap-1 lg:flex">
          {ENLACES.map((e) => (
            <a key={e.href} href={e.href} className="rounded-md px-3 py-2 text-sm font-semibold text-stone-200 hover:bg-white/5 hover:text-white">
              {e.texto}
            </a>
          ))}
        </nav>

        <a href="#contacto" className="btn-naranja ml-auto hidden px-4 py-2.5 sm:inline-flex lg:ml-2">
          <Mensaje /> Solicitá tu presupuesto
        </a>

        <button type="button" className="ml-auto rounded-md p-2 text-white hover:bg-white/10 sm:ml-0 lg:hidden"
          aria-expanded={abierto} aria-controls="menu-movil" aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto(!abierto)}>
          {abierto ? <Cerrar /> : <Menu />}
        </button>
      </div>

      {abierto && (
        <nav id="menu-movil" aria-label="Menú" className="border-t border-white/10 bg-carbon lg:hidden">
          <ul className="contenedor flex flex-col py-2">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <a href={e.href} onClick={() => setAbierto(false)} className="block rounded-md px-2 py-3 text-base font-semibold text-stone-100 hover:bg-white/5">
                  {e.texto}
                </a>
              </li>
            ))}
            <li className="mt-2 grid gap-2 pb-2 sm:hidden">
              <a href="#contacto" onClick={() => setAbierto(false)} className="btn-naranja w-full"><Mensaje /> Solicitá tu presupuesto</a>
            </li>
            <li><a href={appHref} className="block px-2 py-3 text-sm text-stone-400 hover:text-white">Acceso equipo →</a></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
