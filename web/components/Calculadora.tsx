"use client";
import { useState } from "react";
import { linkWhatsApp } from "@/lib/datos";

const TIPOS = ["H8", "H13", "H17", "H21", "H25", "H30"];
const ELEMENTOS = [
  { id: "losa", nombre: "Losa", espesor: 12 },
  { id: "platea", nombre: "Platea", espesor: 20 },
  { id: "contrapiso", nombre: "Contrapiso", espesor: 8 },
  { id: "carpeta", nombre: "Piso / vereda", espesor: 10 },
];

export function Calculadora() {
  const [elemento, setElemento] = useState(ELEMENTOS[0]);
  const [largo, setLargo] = useState(8);
  const [ancho, setAncho] = useState(5);
  const [espesor, setEspesor] = useState(ELEMENTOS[0].espesor);
  const [tipo, setTipo] = useState("H21");

  const bruto = largo * ancho * (espesor / 100);
  const m3 = Math.ceil(bruto * 1.05 * 2) / 2; // +5% desperdicio, redondeo a 0,5 m³
  const wa = linkWhatsApp(
    `Hola OBRAX! Quiero presupuesto de hormigón ${tipo} para ${elemento.nombre.toLowerCase()} de ${largo} x ${ancho} m, ` +
      `${espesor} cm de espesor (aprox. ${m3.toLocaleString("es-AR")} m³).`,
  );

  return (
    <div className="rounded-2xl bg-white p-5 text-grafito shadow-2xl sm:p-7">
      <div className="mb-4 flex flex-wrap gap-2">
        {ELEMENTOS.map((e) => (
          <button
            key={e.id}
            onClick={() => { setElemento(e); setEspesor(e.espesor); }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${e.id === elemento.id ? "bg-grafito text-white" : "bg-stone-100 hover:bg-stone-200"}`}
          >
            {e.nombre}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Campo label="Largo (m)" valor={largo} set={setLargo} />
        <Campo label="Ancho (m)" valor={ancho} set={setAncho} />
        <Campo label="Espesor (cm)" valor={espesor} set={setEspesor} />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Tipo de hormigón</label>
        <div className="grid grid-cols-6 gap-1.5">
          {TIPOS.map((t) => (
            <button key={t} onClick={() => setTipo(t)}
              className={`rounded-md border py-2 text-sm font-bold transition ${t === tipo ? "border-naranja bg-naranja text-white" : "border-stone-300 hover:border-naranja"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4 rounded-xl bg-stone-100 p-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-stone-500">Necesitás aprox.</div>
          <div className="text-4xl font-black text-grafito">
            {Number.isFinite(m3) ? m3.toLocaleString("es-AR") : 0} <span className="text-2xl">m³</span>
          </div>
        </div>
        <p className="max-w-[10rem] text-right text-xs text-stone-500">Incluye 5% de desperdicio. Cálculo orientativo.</p>
      </div>
      {wa ? (
        <a href={wa} target="_blank" rel="noopener" className="btn-naranja mt-4 w-full">Pedir presupuesto por WhatsApp</a>
      ) : (
        <a href="#contacto" className="btn-naranja mt-4 w-full">Pedir presupuesto</a>
      )}
    </div>
  );
}

function Campo({ label, valor, set }: { label: string; valor: number; set: (n: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">{label}</label>
      <input
        type="number" inputMode="decimal" min={0} step="0.1"
        value={valor || ""}
        onChange={(e) => set(Math.max(0, Number(e.target.value)))}
        className="w-full rounded-md border border-stone-300 px-3 py-2.5 text-lg font-semibold outline-none focus:border-naranja focus:ring-2 focus:ring-naranja/20"
      />
    </div>
  );
}
