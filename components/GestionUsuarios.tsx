"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarUsuario, cambiarClave, cambiarEstado, crearUsuario, type Resultado } from "@/app/(app)/usuarios/acciones";
import { NOMBRE_ROL, ROLES_PROXIMAMENTE, descripcionPerfil, type Perfil, type Rol, type UnidadNegocio } from "@/lib/tipos";

type Props = { usuarios: Perfil[]; yoId: string; configurado: boolean };

type Formulario = {
  nombre: string; email: string; telefono: string; clave: string;
  rol: Rol; unidades: UnidadNegocio[]; comision_hormigon: number; comision_materiales: number;
};

const VACIO: Formulario = {
  nombre: "", email: "", telefono: "", clave: "", rol: "vendedor",
  unidades: ["hormigon", "materiales"], comision_hormigon: 0, comision_materiales: 0,
};

/** Genera una contraseña inicial fácil de dictar (ej. "Obrax-4821"). */
const claveSugerida = () => `Obrax-${Math.floor(1000 + Math.random() * 9000)}`;

export function GestionUsuarios({ usuarios, yoId, configurado }: Props) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [abierto, setAbierto] = useState<"nuevo" | string | null>(null);
  const [form, setForm] = useState<Formulario>(VACIO);
  const [msg, setMsg] = useState<Resultado | null>(null);
  const [verInactivos, setVerInactivos] = useState(false);

  const visibles = usuarios.filter((u) => verInactivos || u.activo);
  const inactivos = usuarios.filter((u) => !u.activo).length;

  function abrirNuevo() {
    setForm({ ...VACIO, clave: claveSugerida() });
    setAbierto("nuevo");
    setMsg(null);
  }

  function abrirEditar(u: Perfil) {
    setForm({
      nombre: u.nombre, email: u.email, telefono: u.telefono, clave: "",
      rol: u.rol, unidades: u.unidades, comision_hormigon: Number(u.comision_hormigon), comision_materiales: Number(u.comision_materiales),
    });
    setAbierto(u.id);
    setMsg(null);
  }

  function ejecutar(accion: () => Promise<Resultado>, cerrar = true) {
    iniciar(async () => {
      const r = await accion();
      setMsg(r);
      if (r.ok) {
        if (cerrar) setAbierto(null);
        router.refresh();
      }
    });
  }

  function guardar() {
    if (abierto === "nuevo") ejecutar(() => crearUsuario(form));
    else if (abierto) ejecutar(() => actualizarUsuario(abierto, form));
  }

  function nuevaClave(u: Perfil) {
    const clave = prompt(`Nueva contraseña para ${u.nombre} (mínimo 6 caracteres):`, claveSugerida());
    if (clave) ejecutar(() => cambiarClave(u.id, clave), false);
  }

  function alternarEstado(u: Perfil) {
    const texto = u.activo
      ? `¿Desactivar a ${u.nombre}? No va a poder ingresar, pero sus clientes y presupuestos se conservan.`
      : `¿Reactivar a ${u.nombre}?`;
    if (confirm(texto)) ejecutar(() => cambiarEstado(u.id, !u.activo), false);
  }

  const set = <K extends keyof Formulario>(k: K, v: Formulario[K]) => setForm({ ...form, [k]: v });
  const alternarUnidad = (u: UnidadNegocio) =>
    set("unidades", form.unidades.includes(u) ? form.unidades.filter((x) => x !== u) : [...form.unidades, u]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h1 className="titulo">Usuarios</h1>
          <p className="text-sm text-stone-500">Alta y permisos del equipo de OBRAX. Solo los administradores ven esta pantalla.</p>
        </div>
        <button className="btn-primario" onClick={abrirNuevo} disabled={!configurado}>+ Usuario</button>
      </div>

      {!configurado && (
        <div className="tarjeta border-amber-300 bg-amber-50 text-sm text-amber-900">
          <strong>Falta un paso para crear usuarios.</strong> Cargá la clave de servicio de Supabase en Vercel →
          obrax → Settings → Environment Variables, con el nombre <code>SUPABASE_SERVICE_ROLE_KEY</code> (tipo Sensitive),
          y volvé a desplegar.
        </div>
      )}

      {msg && (
        <div className={`rounded-md p-3 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
          {msg.ok ? msg.mensaje : msg.error}
        </div>
      )}

      {abierto && (
        <div className="tarjeta space-y-4 border-naranja">
          <h2 className="font-bold">{abierto === "nuevo" ? "Nuevo usuario" : `Editar ${form.nombre}`}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Campo l="Nombre y apellido"><input className="input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} /></Campo>
            <Campo l="Email (usuario)">
              <input className="input" type="email" value={form.email} disabled={abierto !== "nuevo"} onChange={(e) => set("email", e.target.value)} />
            </Campo>
            <Campo l="Teléfono"><input className="input" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="11 1234 5678" /></Campo>
            {abierto === "nuevo" && (
              <Campo l="Contraseña inicial"><input className="input font-mono" value={form.clave} onChange={(e) => set("clave", e.target.value)} /></Campo>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Campo l="Rol">
              <select className="input" value={form.rol} onChange={(e) => set("rol", e.target.value as Rol)} disabled={abierto === yoId}>
                {(Object.keys(NOMBRE_ROL) as Rol[]).map((r) => (
                  <option key={r} value={r} disabled={ROLES_PROXIMAMENTE.includes(r)}>
                    {NOMBRE_ROL[r]}{ROLES_PROXIMAMENTE.includes(r) ? " (próximamente)" : ""}
                  </option>
                ))}
              </select>
            </Campo>
            {form.rol === "vendedor" && (
              <Campo l="Vende">
                <div className="flex gap-4 pt-2 text-sm">
                  {(["hormigon", "materiales"] as UnidadNegocio[]).map((u) => (
                    <label key={u} className="flex items-center gap-2">
                      <input type="checkbox" checked={form.unidades.includes(u)} onChange={() => alternarUnidad(u)} />
                      {u === "hormigon" ? "Hormigón" : "Materiales"}
                    </label>
                  ))}
                </div>
              </Campo>
            )}
            {form.rol === "vendedor" && (
              <div className="grid grid-cols-2 gap-3">
                <Campo l="Comisión hormigón %">
                  <input className="input" type="number" step="0.1" min={0} max={100} value={form.comision_hormigon} onChange={(e) => set("comision_hormigon", Number(e.target.value))} />
                </Campo>
                <Campo l="Comisión materiales %">
                  <input className="input" type="number" step="0.1" min={0} max={100} value={form.comision_materiales} onChange={(e) => set("comision_materiales", Number(e.target.value))} />
                </Campo>
              </div>
            )}
          </div>

          <p className="text-xs text-stone-500">
            {form.rol === "admin" && "Administrador: acceso a toda la empresa, precios y usuarios."}
            {form.rol === "vendedor" && "Vendedor: clientes y presupuestos de las unidades marcadas."}
          </p>

          <div className="flex justify-end gap-2">
            <button className="btn-secundario" onClick={() => setAbierto(null)} disabled={pendiente}>Cancelar</button>
            <button className="btn-primario" onClick={guardar} disabled={pendiente || (form.rol === "vendedor" && form.unidades.length === 0)}>
              {pendiente ? "Guardando…" : abierto === "nuevo" ? "Crear usuario" : "Guardar cambios"}
            </button>
          </div>
          {abierto === "nuevo" && (
            <p className="text-xs text-stone-500">Pasale al usuario su email y la contraseña inicial. Puede cambiarla desde "¿Olvidaste tu contraseña?".</p>
          )}
        </div>
      )}

      {/* Celular: tarjetas */}
      <div className="space-y-2 md:hidden">
        {visibles.map((u) => (
          <div key={u.id} className={`tarjeta p-3 ${u.activo ? "" : "opacity-60"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{u.nombre}{u.id === yoId && <span className="ml-1 text-xs font-normal text-stone-400">(vos)</span>}</div>
                <div className="truncate text-sm text-stone-500">{u.email}</div>
                <div className="text-sm">{descripcionPerfil(u)}</div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${u.activo ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                {u.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            {configurado && (
              <div className="mt-3 flex gap-2 border-t border-stone-100 pt-3 text-sm">
                <button className="btn-secundario flex-1 px-2 py-1.5" onClick={() => abrirEditar(u)}>Editar</button>
                <button className="btn-secundario flex-1 px-2 py-1.5" onClick={() => nuevaClave(u)}>Contraseña</button>
                {u.id !== yoId && (
                  <button className={`btn-secundario flex-1 px-2 py-1.5 ${u.activo ? "text-red-600" : "text-green-700"}`} onClick={() => alternarEstado(u)}>
                    {u.activo ? "Desactivar" : "Reactivar"}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="tarjeta hidden overflow-x-auto p-0 sm:p-0 md:block">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
            <tr><th className="px-4 py-2">Nombre</th><th>Email</th><th>Perfil</th><th>Comisiones</th><th>Estado</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visibles.map((u) => (
              <tr key={u.id} className={u.activo ? "" : "text-stone-400"}>
                <td className="px-4 py-2.5 font-medium">
                  {u.nombre}{u.id === yoId && <span className="ml-1 text-xs text-stone-400">(vos)</span>}
                  {u.telefono && <div className="text-xs font-normal text-stone-500">{u.telefono}</div>}
                </td>
                <td>{u.email}</td>
                <td>{descripcionPerfil(u)}</td>
                <td className="text-xs">
                  {u.rol === "vendedor" ? `H ${Number(u.comision_hormigon)}% · M ${Number(u.comision_materiales)}%` : "—"}
                </td>
                <td>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.activo ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="whitespace-nowrap pr-4 text-right">
                  {configurado && (
                    <>
                      <button className="px-2 text-naranja hover:underline" onClick={() => abrirEditar(u)}>Editar</button>
                      <button className="px-2 text-stone-600 hover:underline" onClick={() => nuevaClave(u)}>Contraseña</button>
                      {u.id !== yoId && (
                        <button className={`px-2 hover:underline ${u.activo ? "text-red-600" : "text-green-700"}`} onClick={() => alternarEstado(u)}>
                          {u.activo ? "Desactivar" : "Reactivar"}
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inactivos > 0 && (
        <button className="text-sm text-stone-500 hover:underline" onClick={() => setVerInactivos(!verInactivos)}>
          {verInactivos ? "Ocultar inactivos" : `Ver inactivos (${inactivos})`}
        </button>
      )}
    </div>
  );
}

function Campo({ l, children }: { l: string; children: React.ReactNode }) {
  return <div><label className="label">{l}</label>{children}</div>;
}
