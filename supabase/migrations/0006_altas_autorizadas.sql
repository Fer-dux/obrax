-- OBRAX · Alta de usuarios solo por el administrador
-- GoTrue inserta el usuario antes de guardar app_metadata, así que el trigger
-- no puede depender de esa marca. En su lugar, la app (con la clave de servicio)
-- anota el email en altas_autorizadas justo antes de crear el usuario.
create table if not exists altas_autorizadas (
  email text primary key,
  creado timestamptz not null default now()
);
alter table altas_autorizadas enable row level security;

create or replace function crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare primero boolean := not exists (select 1 from perfiles);
begin
  if not primero then
    if not exists (select 1 from altas_autorizadas where email = lower(new.email)) then
      raise exception 'El registro está cerrado. Pedile al administrador que te dé de alta.';
    end if;
    delete from altas_autorizadas where email = lower(new.email);
  end if;
  insert into perfiles (id, nombre, email, rol)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nombre', ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    case when primero then 'admin'::rol_usuario else 'vendedor'::rol_usuario end
  );
  return new;
end $$;

revoke execute on function public.crear_perfil() from public, anon, authenticated;
