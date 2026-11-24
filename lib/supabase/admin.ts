import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Cliente con la clave de servicio. SOLO en el servidor: saltea RLS. */
export function crearClienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const hayClaveServicio = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
