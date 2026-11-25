"use server";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import type { Rol, UnidadNegocio } from "@/lib/tipos";

export type Resultado = { ok: true; mensaje: string } | { ok: false; error: string };

const ROLES_VALIDOS: Rol[] = ["admin", "vendedor", "logistica", "administracion"];
const UNIDADES_VALIDAS: UnidadNegocio[] = ["hormigon", "materiales"];

async function exigirAdmin() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sesión vencida. Volvé a ingresar.");
  const { data: perfil } = await supabase.from("perfiles").select("rol, activo").eq("id", data.user.id).single();
  if (perfil?.rol !== "admin" || !perfil.activo) throw new Error("Solo un administrador puede gestionar usuarios.");
  const admin = crearClienteAdmin();
  if (!admin) throw new Error("Falta configurar SUPABASE_SERVICE_ROLE_KEY en Vercel.");
  return { admin, yo: data.user.id };
}

function limpiarUnidades(u: unknown): UnidadNegocio[] {
  const lista = Array.isArray(u) ? u.filter((x): x is UnidadNegocio => UNIDADES_VALIDAS.includes(x)) : [];
  return lista.length ? lista : [...UNIDADES_VALIDAS];
}

function porcentaje(n: unknown) {
  const v = Number(n);
  return Number.isFinite(v) ? Math.min(Math.max(v, 0), 100) : 0;
}

function traducirError(msg: string) {
  if (/already (been )?registered|already exists/i.test(msg)) return "Ya existe un usuario con ese email.";
  if (/password/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/email/i.test(msg)) return "El email no es válido.";
  return msg;
}

export async function crearUsuario(datos: {
  nombre: string; email: string; telefono: string; clave: string;
  rol: Rol; unidades: UnidadNegocio[]; comision_hormigon: number; comision_materiales: number;
}): Promise<Resultado> {
  try {
    const { admin } = await exigirAdmin();
    const email = datos.email.trim().toLowerCase();
    const nombre = datos.nombre.trim();
    if (!nombre) return { ok: false, error: "Falta el nombre." };
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "El email no es válido." };
    if ((datos.clave ?? "").length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
    if (!ROLES_VALIDOS.includes(datos.rol)) return { ok: false, error: "Rol inválido." };

    // Autoriza este email para que la base acepte el alta (registro público cerrado).
    const { error: eAut } = await admin.from("altas_autorizadas").upsert({ email });
    if (eAut) return { ok: false, error: "No se pudo autorizar el alta: " + eAut.message };

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: datos.clave,
      email_confirm: true,
      user_metadata: { nombre },
      app_metadata: { alta_por_admin: true },
    });
    if (error || !data.user) {
      await admin.from("altas_autorizadas").delete().eq("email", email);
      return { ok: false, error: traducirError(error?.message ?? "No se pudo crear el usuario.") };
    }

    const { error: e2 } = await admin.from("perfiles").update({
      nombre,
      email,
      telefono: datos.telefono.trim(),
      rol: datos.rol,
      unidades: limpiarUnidades(datos.unidades),
      comision_hormigon: porcentaje(datos.comision_hormigon),
      comision_materiales: porcentaje(datos.comision_materiales),
      activo: true,
    }).eq("id", data.user.id);
    if (e2) return { ok: false, error: "Usuario creado, pero no se pudo guardar el perfil: " + e2.message };

    revalidatePath("/usuarios");
    return { ok: true, mensaje: `Usuario ${nombre} creado. Ya puede ingresar con ${email}.` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function actualizarUsuario(id: string, datos: {
  nombre: string; telefono: string; rol: Rol; unidades: UnidadNegocio[];
  comision_hormigon: number; comision_materiales: number;
}): Promise<Resultado> {
  try {
    const { admin, yo } = await exigirAdmin();
    if (!ROLES_VALIDOS.includes(datos.rol)) return { ok: false, error: "Rol inválido." };
    if (id === yo && datos.rol !== "admin") return { ok: false, error: "No podés quitarte el rol de administrador a vos mismo." };

    const { error } = await admin.from("perfiles").update({
      nombre: datos.nombre.trim(),
      telefono: datos.telefono.trim(),
      rol: datos.rol,
      unidades: limpiarUnidades(datos.unidades),
      comision_hormigon: porcentaje(datos.comision_hormigon),
      comision_materiales: porcentaje(datos.comision_materiales),
    }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/usuarios");
    return { ok: true, mensaje: "Cambios guardados." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function cambiarEstado(id: string, activo: boolean): Promise<Resultado> {
  try {
    const { admin, yo } = await exigirAdmin();
    if (id === yo && !activo) return { ok: false, error: "No podés desactivarte a vos mismo." };
    // Bloquea el ingreso (y cierra sesiones al vencer el token) sin borrar sus datos.
    const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: activo ? "none" : "876000h" });
    if (error) return { ok: false, error: error.message };
    const { error: e2 } = await admin.from("perfiles").update({ activo }).eq("id", id);
    if (e2) return { ok: false, error: e2.message };
    revalidatePath("/usuarios");
    return { ok: true, mensaje: activo ? "Usuario reactivado." : "Usuario desactivado. Ya no puede ingresar." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function cambiarClave(id: string, clave: string): Promise<Resultado> {
  try {
    const { admin } = await exigirAdmin();
    if ((clave ?? "").length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
    const { error } = await admin.auth.admin.updateUserById(id, { password: clave });
    if (error) return { ok: false, error: traducirError(error.message) };
    return { ok: true, mensaje: "Contraseña actualizada." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
