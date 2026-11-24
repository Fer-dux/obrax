"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

type Modo = "ingresar" | "registrar" | "recuperar";

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("ingresar");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);

  function cambiarModo(m: Modo) {
    setModo(m);
    setError("");
    setAviso("");
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAviso("");
    setCargando(true);
    const supabase = crearClienteNavegador();

    if (modo === "ingresar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
      if (error) setError("Email o contraseña incorrectos.");
      else {
        router.replace("/");
        router.refresh();
      }
    } else if (modo === "registrar") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: clave,
        options: { data: { nombre }, emailRedirectTo: `${location.origin}/` },
      });
      if (error) setError(error.message);
      else if (!data.session) setAviso("Te enviamos un email para confirmar la cuenta.");
      else {
        router.replace("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/restablecer`,
      });
      if (error && /rate|seconds|limit/i.test(error.message)) {
        setError("Se pidieron demasiados emails. Esperá unos minutos y volvé a intentar.");
      } else {
        // No revelamos si el email existe o no.
        setAviso("Si el email está registrado, vas a recibir un link para crear una contraseña nueva. Revisá también la carpeta de spam.");
      }
    }
    setCargando(false);
  }

  const textoBoton = { ingresar: "Ingresar", registrar: "Crear cuenta", recuperar: "Enviar link" }[modo];

  return (
    <div className="flex min-h-screen items-center justify-center bg-grafito p-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div className="text-center">
          <Logo className="mx-auto h-10" />
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-stone-500">Soluciones para la construcción</p>
        </div>

        {modo === "recuperar" && (
          <div>
            <h1 className="font-bold">Recuperar contraseña</h1>
            <p className="text-sm text-stone-500">Ingresá tu email y te enviamos un link para crear una nueva.</p>
          </div>
        )}

        {modo === "registrar" && (
          <div>
            <label className="label">Nombre y apellido</label>
            <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {modo !== "recuperar" && (
          <div>
            <div className="flex items-baseline justify-between">
              <label className="label">Contraseña</label>
              {modo === "ingresar" && (
                <button type="button" className="text-xs text-naranja hover:underline" onClick={() => cambiarModo("recuperar")}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <input
              className="input"
              type="password"
              autoComplete={modo === "ingresar" ? "current-password" : "new-password"}
              minLength={6}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {aviso && <p className="text-sm text-green-700">{aviso}</p>}

        <button className="btn-primario w-full" disabled={cargando}>
          {cargando ? "Un momento…" : textoBoton}
        </button>

        {modo === "ingresar" ? (
          <button type="button" className="w-full text-sm text-stone-500 hover:text-grafito" onClick={() => cambiarModo("registrar")}>
            ¿Sos nuevo en el equipo? Crear cuenta
          </button>
        ) : (
          <button type="button" className="w-full text-sm text-stone-500 hover:text-grafito" onClick={() => cambiarModo("ingresar")}>
            ← Volver a ingresar
          </button>
        )}
      </form>
    </div>
  );
}
