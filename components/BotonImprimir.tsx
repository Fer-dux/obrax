"use client";
export function BotonImprimir() {
  return <button className="btn-primario" onClick={() => window.print()}>Descargar PDF / Imprimir</button>;
}
