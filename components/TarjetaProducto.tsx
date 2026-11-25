"use client";
import { useState } from "react";
import { pesos, fechaAR } from "@/lib/calculos";
import type { Producto } from "@/lib/tipos";

export function TarjetaProducto({ p, esAdmin, upd, guardar }: {
  p: Producto;
  esAdmin: boolean;
  upd: (id: string, k: keyof Producto, v: string | number | boolean) => void;
  guardar: (p: Producto) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [sucio, setSucio] = useState(false);
  const cambiar = (k: keyof Producto, v: string | number | boolean) => { upd(p.id, k, v); setSucio(true); };

  return (
    <div className="tarjeta p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-snug">{p.descripcion}</div>
          <div className="mt-0.5 text-xs text-stone-500">
            {[p.codigo, p.categoria, `por ${p.unidad}`].filter(Boolean).join(" · ")}
            {!p.acopiable && " · no acopiable"}
          </div>
        </div>
        {!esAdmin && <div className="shrink-0 text-right font-bold">{pesos(p.precio)}</div>}
      </div>

      {esAdmin && (
        <>
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <label className="label">Precio c/IVA</label>
              <input className="input text-right font-semibold" type="number" inputMode="decimal" step="0.01"
                value={p.precio} onChange={(e) => cambiar("precio", Number(e.target.value))} />
            </div>
            <button className="btn-secundario px-3" onClick={() => setEditando(!editando)}>{editando ? "Cerrar" : "Editar"}</button>
            <button className="btn-primario px-3" disabled={!sucio} onClick={() => { guardar(p); setSucio(false); }}>Guardar</button>
          </div>

          {editando && (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
              <div className="col-span-2">
                <label className="label">Descripción</label>
                <input className="input" value={p.descripcion} onChange={(e) => cambiar("descripcion", e.target.value)} />
              </div>
              <div>
                <label className="label">Código</label>
                <input className="input" value={p.codigo} onChange={(e) => cambiar("codigo", e.target.value)} />
              </div>
              <div>
                <label className="label">Unidad</label>
                <input className="input" value={p.unidad} onChange={(e) => cambiar("unidad", e.target.value)} />
              </div>
              <div>
                <label className="label">Categoría</label>
                <input className="input" value={p.categoria} onChange={(e) => cambiar("categoria", e.target.value)} />
              </div>
              <div>
                <label className="label">Costo</label>
                <input className="input text-right" type="number" inputMode="decimal" step="0.01" value={p.costo}
                  onChange={(e) => cambiar("costo", Number(e.target.value))} />
              </div>
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={p.acopiable} onChange={(e) => cambiar("acopiable", e.target.checked)} /> Se puede acopiar
              </label>
              <p className="col-span-2 text-xs text-stone-400">Actualizado el {fechaAR(p.actualizado)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
