import { Logo } from "@/components/Logo";

export default function ConfiguracionPendiente() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="tarjeta max-w-lg space-y-3">
        <Logo className="h-8" />
        <h1 className="titulo">Falta conectar la base de datos</h1>
        <p className="text-sm text-stone-600">
          OBRAX necesita Supabase. Configurá las variables <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en Vercel (o instalá la integración de Supabase
          desde Vercel → Storage) y volvé a desplegar.
        </p>
      </div>
    </div>
  );
}
