export type UnidadNegocio = "hormigon" | "materiales";
export type CondicionFiscal = "consumidor_final" | "responsable_inscripto" | "monotributo" | "exento";
export type EstadoPresupuesto = "borrador" | "enviado" | "aceptado" | "perdido";

export type Rol = "admin" | "vendedor" | "logistica" | "administracion";

export type Perfil = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  rol: Rol;
  unidades: UnidadNegocio[];
  comision_hormigon: number;
  comision_materiales: number;
};

export type Cliente = {
  id: string;
  nombre: string;
  tipo: string;
  cuit: string;
  condicion_fiscal: CondicionFiscal;
  telefono: string;
  email: string;
  notas: string;
  vendedor_id: string | null;
  creado: string;
  estado: "prospecto" | "cliente";
  origen: string;
};

export type Obra = {
  id: string;
  cliente_id: string;
  nombre: string;
  direccion: string;
  localidad: string;
  contacto_obra: string;
  notas: string;
};

export type Producto = {
  id: string;
  unidad_negocio: UnidadNegocio;
  categoria: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  precio: number;
  costo: number;
  iva: number;
  acopiable: boolean;
  activo: boolean;
  actualizado: string;
};

export type Presupuesto = {
  id: string;
  numero: number;
  token: string;
  cliente_id: string | null;
  obra_id: string | null;
  vendedor_id: string | null;
  fecha: string;
  vigencia_dias: number;
  estado: EstadoPresupuesto;
  motivo_perdida: string;
  descuento: number;
  es_acopio: boolean;
  notas: string;
  actualizado: string;
};

export type Item = {
  id: string;
  presupuesto_id?: string;
  producto_id: string | null;
  unidad_negocio: UnidadNegocio;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio: number;
  iva: number;
  orden: number;
};

export type EstadoConsulta = "nueva" | "en_curso" | "presupuestada" | "descartada";

export type Consulta = {
  id: string;
  creado: string;
  nombre: string;
  telefono: string;
  email: string;
  necesita: string;
  obra: string;
  mensaje: string;
  origen: string;
  estado: EstadoConsulta;
  atendida_por: string | null;
  cliente_id: string | null;
  presupuesto_id: string | null;
};

export const NOMBRE_ESTADO_CONSULTA: Record<EstadoConsulta, string> = {
  nueva: "Nueva",
  en_curso: "En curso",
  presupuestada: "Presupuestada",
  descartada: "Descartada",
};

export const NOMBRE_UNIDAD: Record<UnidadNegocio, string> = {
  hormigon: "Hormigón",
  materiales: "Materiales",
};

export const NOMBRE_ROL: Record<Rol, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
  logistica: "Logística",
  administracion: "Administración",
};

/** Roles del PDF que todavía no tienen módulo propio. */
export const ROLES_PROXIMAMENTE: Rol[] = ["logistica", "administracion"];

/** Nombre del perfil comercial según rol + unidades (ej. "Vendedor hormigón"). */
export function descripcionPerfil(p: Pick<Perfil, "rol" | "unidades">) {
  if (p.rol !== "vendedor") return NOMBRE_ROL[p.rol];
  if (p.unidades.length === 1) return `Vendedor ${p.unidades[0] === "hormigon" ? "hormigón" : "materiales"}`;
  return "Vendedor hormigón y materiales";
}

export const NOMBRE_CONDICION: Record<CondicionFiscal, string> = {
  consumidor_final: "Consumidor final",
  responsable_inscripto: "Responsable inscripto",
  monotributo: "Monotributo",
  exento: "Exento",
};
