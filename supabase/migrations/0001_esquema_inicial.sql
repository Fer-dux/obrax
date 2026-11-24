-- OBRAX · Esquema inicial (MVP)
-- Ejecutar en Supabase: SQL Editor → pegar y "Run".

create extension if not exists "pgcrypto";

-- ───────────── Tipos ─────────────
create type unidad_negocio as enum ('hormigon', 'materiales');
create type rol_usuario as enum ('admin', 'vendedor');
create type condicion_fiscal as enum ('consumidor_final', 'responsable_inscripto', 'monotributo', 'exento');
create type estado_presupuesto as enum ('borrador', 'enviado', 'aceptado', 'perdido');

-- ───────────── Perfiles (usuarios) ─────────────
create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  telefono text not null default '',
  rol rol_usuario not null default 'vendedor',
  unidades unidad_negocio[] not null default array['hormigon','materiales']::unidad_negocio[],
  comision_hormigon numeric(5,2) not null default 0,
  comision_materiales numeric(5,2) not null default 0,
  creado timestamptz not null default now()
);

-- El primer usuario registrado queda como admin; el resto como vendedor.
create or replace function crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    case when exists (select 1 from perfiles) then 'vendedor'::rol_usuario else 'admin'::rol_usuario end
  );
  return new;
end $$;

create trigger al_crear_usuario after insert on auth.users
for each row execute function crear_perfil();

create or replace function es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'admin');
$$;

-- ───────────── Clientes y obras (cartera única) ─────────────
create table clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null default 'particular', -- particular, arquitecto, constructora, corralon...
  cuit text not null default '',
  condicion_fiscal condicion_fiscal not null default 'consumidor_final',
  telefono text not null default '',
  email text not null default '',
  notas text not null default '',
  vendedor_id uuid references perfiles(id) on delete set null,
  creado timestamptz not null default now()
);

create table obras (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  nombre text not null,
  direccion text not null default '',
  localidad text not null default '',
  contacto_obra text not null default '',
  notas text not null default '',
  creado timestamptz not null default now()
);

-- ───────────── Productos (una lista por unidad) ─────────────
-- precio: precio de venta FINAL con IVA incluido.
-- costo: costo de compra con IVA incluido (opcional, para rentabilidad).
create table productos (
  id uuid primary key default gen_random_uuid(),
  unidad_negocio unidad_negocio not null,
  categoria text not null default 'general', -- hormigon, bomba, aditivo, flete, recargo, aridos, cemento...
  codigo text not null default '',
  descripcion text not null,
  unidad text not null default 'u',          -- m³, bolsa, u, kg, viaje...
  precio numeric(14,2) not null default 0,
  costo numeric(14,2) not null default 0,
  iva numeric(5,2) not null default 21,
  acopiable boolean not null default true,
  activo boolean not null default true,
  actualizado timestamptz not null default now()
);
create index on productos (unidad_negocio, categoria);

-- ───────────── Presupuestos ─────────────
create sequence presupuesto_numero start 1;

create table presupuestos (
  id uuid primary key default gen_random_uuid(),
  numero int not null default nextval('presupuesto_numero') unique,
  token uuid not null default gen_random_uuid() unique, -- link público para el cliente
  cliente_id uuid references clientes(id) on delete set null,
  obra_id uuid references obras(id) on delete set null,
  vendedor_id uuid references perfiles(id) on delete set null default auth.uid(),
  fecha date not null default current_date,
  vigencia_dias int not null default 7,
  estado estado_presupuesto not null default 'borrador',
  motivo_perdida text not null default '',
  descuento numeric(5,2) not null default 0,
  es_acopio boolean not null default false,
  notas text not null default '',
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

create table presupuesto_items (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null references presupuestos(id) on delete cascade,
  producto_id uuid references productos(id) on delete set null,
  unidad_negocio unidad_negocio not null,
  descripcion text not null,
  unidad text not null default 'u',
  cantidad numeric(14,3) not null default 1,
  precio numeric(14,2) not null default 0, -- unitario, IVA incluido
  iva numeric(5,2) not null default 21,
  orden int not null default 0
);
create index on presupuesto_items (presupuesto_id);

-- ───────────── Seguridad (RLS) ─────────────
alter table perfiles enable row level security;
alter table clientes enable row level security;
alter table obras enable row level security;
alter table productos enable row level security;
alter table presupuestos enable row level security;
alter table presupuesto_items enable row level security;

-- Perfiles: todos los usuarios ven el equipo; cada uno edita el suyo; admin edita todos.
create policy perfiles_ver on perfiles for select to authenticated using (true);
create policy perfiles_editar on perfiles for update to authenticated
  using (id = auth.uid() or es_admin()) with check (id = auth.uid() or es_admin());

-- Cartera única: todo el equipo comercial ve y edita clientes y obras.
create policy clientes_todo on clientes for all to authenticated using (true) with check (true);
create policy obras_todo on obras for all to authenticated using (true) with check (true);

-- Productos: todos los ven; solo admin modifica precios.
create policy productos_ver on productos for select to authenticated using (true);
create policy productos_admin on productos for all to authenticated using (es_admin()) with check (es_admin());

-- Presupuestos: todo el equipo los ve y edita (MVP).
create policy presupuestos_todo on presupuestos for all to authenticated using (true) with check (true);
create policy items_todo on presupuesto_items for all to authenticated using (true) with check (true);

-- Evitar que un vendedor se autoasigne rol admin.
create or replace function proteger_rol() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.rol <> old.rol and not es_admin() then
    raise exception 'Solo un administrador puede cambiar roles';
  end if;
  return new;
end $$;
create trigger perfiles_proteger_rol before update on perfiles
for each row execute function proteger_rol();

-- ───────────── Vista pública del presupuesto (link de WhatsApp) ─────────────
create or replace function presupuesto_publico(p_token uuid) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'presupuesto', to_json(p),
    'cliente', (select json_build_object('nombre', c.nombre, 'cuit', c.cuit, 'condicion_fiscal', c.condicion_fiscal, 'telefono', c.telefono) from clientes c where c.id = p.cliente_id),
    'obra', (select json_build_object('nombre', o.nombre, 'direccion', o.direccion, 'localidad', o.localidad) from obras o where o.id = p.obra_id),
    'vendedor', (select json_build_object('nombre', v.nombre, 'telefono', v.telefono) from perfiles v where v.id = p.vendedor_id),
    'items', coalesce((select json_agg(i order by i.unidad_negocio, i.orden) from presupuesto_items i where i.presupuesto_id = p.id), '[]'::json)
  )
  from presupuestos p where p.token = p_token;
$$;
grant execute on function presupuesto_publico(uuid) to anon, authenticated;

-- Actualización masiva de precios por porcentaje (solo admin).
create or replace function actualizar_precios(p_unidad unidad_negocio, p_porcentaje numeric, p_categoria text default null)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not es_admin() then raise exception 'Solo un administrador puede actualizar precios'; end if;
  update productos
     set precio = round(precio * (1 + p_porcentaje / 100), 2), actualizado = now()
   where unidad_negocio = p_unidad and (p_categoria is null or categoria = p_categoria);
  get diagnostics n = row_count;
  return n;
end $$;
grant execute on function actualizar_precios(unidad_negocio, numeric, text) to authenticated;
