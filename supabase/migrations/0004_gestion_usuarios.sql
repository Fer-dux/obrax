-- OBRAX · Gestión de usuarios
-- Roles del PDF: admin, vendedor (hormigón / materiales / ambos vía "unidades"),
-- logística y administración (preparados para los próximos módulos).
alter type rol_usuario add value if not exists 'logistica';
alter type rol_usuario add value if not exists 'administracion';

alter table perfiles
  add column if not exists email text not null default '',
  add column if not exists activo boolean not null default true;

update perfiles p set email = u.email from auth.users u where u.id = p.id and p.email = '';

-- Registro cerrado: después del primer usuario (admin), solo se crean usuarios
-- desde la pantalla Usuarios (API de administración, que marca app_metadata.alta_por_admin).
create or replace function crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare primero boolean := not exists (select 1 from perfiles);
begin
  if not primero and coalesce(new.raw_app_meta_data->>'alta_por_admin', '') <> 'true' then
    raise exception 'El registro está cerrado. Pedile al administrador que te dé de alta.';
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

-- Solo un admin (o el servidor con la clave de servicio) cambia rol, unidades, comisiones o estado.
create or replace function proteger_rol() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (new.rol, new.unidades, new.comision_hormigon, new.comision_materiales, new.activo, new.email)
     is distinct from (old.rol, old.unidades, old.comision_hormigon, old.comision_materiales, old.activo, old.email)
     and not es_admin()
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Solo un administrador puede cambiar estos datos';
  end if;
  return new;
end $$;

revoke execute on function public.crear_perfil() from public, anon, authenticated;
revoke execute on function public.proteger_rol() from public, anon, authenticated;
