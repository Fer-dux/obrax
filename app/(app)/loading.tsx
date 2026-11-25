import { Spinner } from "@/components/Spinner";

/** Se muestra mientras se cargan los datos de cualquier pantalla de la app. */
export default function Cargando() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3 text-stone-500">
        <Spinner className="h-5 w-5 text-naranja" />
        <span className="text-sm">Cargando…</span>
      </div>
      <div className="h-7 w-48 animate-pulse rounded-md bg-stone-200" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />)}
      </div>
      {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white" />)}
    </div>
  );
}
