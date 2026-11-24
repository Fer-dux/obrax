# OBRAX · Aplicación comercial

Cotizador y gestión comercial de **OBRAX – Soluciones para la construcción**, con dos unidades de negocio
(**Hormigón elaborado** y **Materiales**) que comparten clientes, vendedores y seguimiento.

## Qué incluye este MVP
- **Clientes y obras** en una sola cartera compartida (condición fiscal, CUIT, WhatsApp).
- **Presupuesto combinado**: hormigón + materiales en el mismo documento, con sugerencias de venta cruzada.
- **Cotizador de hormigón**: tipos H8 a H30, calculadora de m³, bomba, aditivos, flete, recargos y aviso de carga mínima.
- **Listas de precios por unidad** (con IVA incluido), costo opcional y actualización masiva por %.
- **PDF con la marca** (vista pública por link) y **envío por WhatsApp**.
- **Estados**: borrador → enviado → aceptado / perdido (con motivo). Presupuestos de **acopio**.
- **Panel**: ventas por unidad, pendientes, conversión, ventas cruzadas y ventas por vendedor.
- **Usuarios**: el primer usuario registrado es `admin`; el resto los da de alta el admin desde la pantalla Usuarios (requiere `SUPABASE_SERVICE_ROLE_KEY` en Vercel). Registro público cerrado.

## Stack
Next.js 15 · React 19 · Tailwind · Supabase (Postgres + Auth + RLS) · Vercel.

## Puesta en marcha
1. Crear la base en Supabase (desde Vercel → Storage → Supabase, o en supabase.com).
2. En Supabase → **SQL Editor**, ejecutar en orden:
   - `supabase/migrations/0001_esquema_inicial.sql`
   - `supabase/migrations/0002_datos_iniciales.sql` (lista de materiales + precios de hormigón **de ejemplo**)
   - `supabase/migrations/0003_permisos_funciones.sql`
   - `supabase/migrations/0004_gestion_usuarios.sql`
3. Variables de entorno (ver `.env.example`): `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Desarrollo local: `npm install && npm run dev`.

## Próximas fases
Comisiones, stock, logística y programación de camiones, facturación y cobranzas, reportes de rentabilidad.
