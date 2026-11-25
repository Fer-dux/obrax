"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Evento para mostrar la barra desde código (router.push, acciones, etc.). */
export const EVENTO_CARGA = "obrax:cargando";
export const iniciarCarga = () => window.dispatchEvent(new Event(EVENTO_CARGA));

/** Barra naranja de progreso arriba de todo al navegar entre pantallas. */
export function BarraCarga() {
  const ruta = usePathname();
  const params = useSearchParams();
  const [activa, setActiva] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function arrancar() {
    if (timer.current) return;
    setActiva(true);
    setProgreso(12);
    timer.current = setInterval(() => setProgreso((p) => (p < 85 ? p + (90 - p) * 0.12 : p)), 200);
  }

  function terminar() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setProgreso(100);
    setTimeout(() => { setActiva(false); setProgreso(0); }, 250);
  }

  // Cualquier toque en un link interno arranca la barra.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      arrancar();
    };
    const onEvento = () => arrancar();
    document.addEventListener("click", onClick, true);
    window.addEventListener(EVENTO_CARGA, onEvento);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(EVENTO_CARGA, onEvento);
    };
  }, []);

  // Cuando cambia la pantalla, termina.
  useEffect(() => { terminar(); }, [ruta, params]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        className="h-full bg-naranja shadow-[0_0_8px_#EE7623] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${progreso}%`, opacity: activa ? 1 : 0 }}
      />
    </div>
  );
}
