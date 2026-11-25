"use client";
/** Descarga el PDF real del presupuesto (en celular lo abre el visor del teléfono). */
export function BotonImprimir({ token }: { token: string }) {
  return (
    <a className="btn-primario" href={`/p/${token}/pdf`} target="_blank" rel="noopener">
      Descargar PDF
    </a>
  );
}
