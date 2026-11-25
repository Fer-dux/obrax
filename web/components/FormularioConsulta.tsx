"use client";
import { useEffect, useRef, useState } from "react";

export const EVENTO_PREFILL = "obrax:prefill-consulta";
const OPCIONES = ["Hormigón", "Materiales", "Hormigón y materiales", "Otro"];

export function FormularioConsulta() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [necesita, setNecesita] = useState("Hormigón");
  const [mensaje, setMensaje] = useState("");
  const abierto = useRef(Date.now());

  // La calculadora de m³ completa el pedido.
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent<{ mensaje: string; necesita?: string }>).detail;
      setMensaje(d.mensaje);
      if (d.necesita) setNecesita(d.necesita);
      setEstado("idle");
    };
    window.addEventListener(EVENTO_PREFILL, h);
    return () => window.removeEventListener(EVENTO_PREFILL, h);
  }, []);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setEstado("enviando");
    setError("");
    try {
      const r = await fetch("/api/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(f.entries()), necesita, mensaje, t: abierto.current }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setEstado("ok");
        (e.target as HTMLFormElement).reset();
        setMensaje("");
      } else {
        setEstado("error");
        setError(j.error || "No pudimos enviar la consulta. Probá de nuevo.");
      }
    } catch {
      setEstado("error");
      setError("Sin conexión. Probá de nuevo en un momento.");
    }
  }

  if (estado === "ok") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-grafito shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">✓</div>
        <h3 className="mt-4 text-xl font-black">¡Recibimos tu consulta!</h3>
        <p className="mt-2 text-stone-600">Te contactamos a la brevedad con tu presupuesto.</p>
        <button className="mt-6 text-sm font-semibold text-naranja hover:underline" onClick={() => setEstado("idle")}>Enviar otra consulta</button>
      </div>
    );
  }

  const campo = "w-full rounded-md border border-stone-300 px-3 py-2.5 text-grafito outline-none focus:border-naranja focus:ring-2 focus:ring-naranja/20";
  const etiqueta = "mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500";

  return (
    <form onSubmit={enviar} className="space-y-4 rounded-2xl bg-white p-5 text-grafito shadow-2xl sm:p-7">
      <div>
        <span className={etiqueta}>¿Qué necesitás?</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {OPCIONES.map((o) => (
            <button type="button" key={o} onClick={() => setNecesita(o)}
              className={`rounded-md border px-2 py-2 text-sm font-semibold transition ${o === necesita ? "border-naranja bg-naranja text-white" : "border-stone-300 hover:border-naranja"}`}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={etiqueta} htmlFor="nombre">Nombre y apellido *</label>
          <input id="nombre" name="nombre" required minLength={2} maxLength={120} autoComplete="name" className={campo} />
        </div>
        <div>
          <label className={etiqueta} htmlFor="telefono">Teléfono / WhatsApp</label>
          <input id="telefono" name="telefono" type="tel" inputMode="tel" maxLength={40} autoComplete="tel" placeholder="11 2345 6789" className={campo} />
        </div>
        <div>
          <label className={etiqueta} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" maxLength={160} autoComplete="email" className={campo} />
        </div>
        <div className="sm:col-span-2">
          <label className={etiqueta} htmlFor="obra">Ubicación de la obra</label>
          <input id="obra" name="obra" maxLength={200} placeholder="Calle, localidad" className={campo} />
        </div>
        <div className="sm:col-span-2">
          <label className={etiqueta} htmlFor="mensaje">Contanos qué necesitás</label>
          <textarea id="mensaje" name="mensaje" rows={4} maxLength={2000} value={mensaje} onChange={(e) => setMensaje(e.target.value)}
            placeholder="Ej.: 12 m³ de H21 para una losa, con bomba. También cemento y arena." className={campo} />
        </div>
      </div>
      {/* Campo trampa anti-spam: invisible para personas */}
      <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <p className="text-xs text-stone-500">* Dejanos al menos un teléfono o un email para responderte.</p>
      {estado === "error" && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="btn-naranja w-full" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Enviando…" : "Pedir presupuesto"}
      </button>
    </form>
  );
}
