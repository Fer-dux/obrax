"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

type Estado = "verificando" | "listo" | "invalido" | "hecho";

export default function Restablecer() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [clave, setClave] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let activo = true;
    async function verificar() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (params.get("error_description")) {
        if (activo) setEstado("invalido");
        return;
      }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          window.history.replaceState(null, "", "/restablecer");
          if (activo) setEstado("listo");
          return;
        }
      }
      // Puede que el cliente ya haya canjeado el código automáticamente.
      const { data } = await supabase.auth.getSession();
      if (activo) setEstado(data.session ? "listo" : "invalido");
    }
    verificar();
    return () => {
      activo = false;
    };
  }, [supabase]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (clave.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (clave !== repetir) return setError("Las contraseñas no coinciden.");
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password: clave });
    setCargando(false);
    if (error) {
      setError(/different|same/i.test(error.message) ? "La contraseña nueva tiene que ser distinta a la anterior." : error.message);
      return;
    }
    setEstado("hecho");
    setTimeout(() => {
      router.replace("/");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grafito p-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <Logo className="mx-auto h-10" />

        {estado === "verificando" && <p className="text-center text-sm text-stone-500">Verificando el link…</p>}

        {estado === "invalido" && (
          <div className="space-y-3 text-center">
            <h1 className="font-bold">El link no es válido o venció</h1>
            <p className="text-sm text-stone-500">
              Pedí uno nuevo y abrilo desde el mismo navegador donde lo solicitaste.
            </p>
            <Link href="/login" className="btn-primario w-full">Volver al ingreso</Link>
          </div>
        )}

        {estado === "listo" && (
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <h1 className="font-bold">Crear contraseña nueva</h1>
              <p className="text-sm text-stone-500">Elegí una contraseña de al menos 6 caracteres.</p>
            </div>
            <div>
              <label className="label">Contraseña nueva</label>
              <input className="input" type="password" autoComplete="new-password" minLength={6} value={clave} onChange={(e) => setClave(e.target.value)} required />
            </div>
            <div>
              <label className="label">Repetir contraseña</label>
              <input className="input" type="password" autoComplete="new-password" minLength={6} value={repetir} onChange={(e) => setRepetir(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="btn-primario w-full" disabled={cargando}>{cargando ? "Guardando…" : "Guardar contraseña"}</button>
          </form>
        )}

        {estado === "hecho" && (
          <p className="text-center text-sm text-green-700">¡Listo! Tu contraseña se actualizó. Entrando…</p>
        )}
      </div>
    </div>
  );
}
