-- OBRAX · Prospectos: las consultas de la web crean (o vinculan) el cliente como prospecto
alter table clientes
  add column if not exists estado text not null default 'cliente' check (estado in ('prospecto', 'cliente')),
  add column if not exists origen text not null default '';

create or replace function buscar_cliente(p_email text, p_telefono text) returns uuid
language sql stable security definer set search_path = public as $$
  select id from clientes
  where (coalesce(p_email, '') <> '' and lower(email) = lower(p_email))
     or (length(regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g')) >= 8
         and right(regexp_replace(telefono, '\D', '', 'g'), 8) = right(regexp_replace(p_telefono, '\D', '', 'g'), 8))
  order by creado
  limit 1;
$$;

create or replace function vincular_cliente_consulta() returns trigger
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if new.cliente_id is null then
    cid := buscar_cliente(new.email, new.telefono);
    if cid is null then
      insert into clientes (nombre, telefono, email, estado, origen, notas)
      values (new.nombre, new.telefono, new.email, 'prospecto', 'web', 'Prospecto desde el formulario de la web')
      returning id into cid;
    end if;
    new.cliente_id := cid;
  end if;
  return new;
end $$;

drop trigger if exists consultas_vincular_cliente on consultas;
create trigger consultas_vincular_cliente before insert on consultas
for each row execute function vincular_cliente_consulta();

create or replace function prospecto_a_cliente() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.estado = 'aceptado' and new.cliente_id is not null then
    update clientes set estado = 'cliente' where id = new.cliente_id and estado = 'prospecto';
  end if;
  return new;
end $$;

drop trigger if exists presupuestos_prospecto_a_cliente on presupuestos;
create trigger presupuestos_prospecto_a_cliente after insert or update of estado on presupuestos
for each row execute function prospecto_a_cliente();

revoke execute on function public.buscar_cliente(text, text) from public, anon;
revoke execute on function public.vincular_cliente_consulta() from public, anon, authenticated;
revoke execute on function public.prospecto_a_cliente() from public, anon, authenticated;
grant execute on function public.buscar_cliente(text, text) to authenticated;

-- Backfill: consultas existentes sin cliente
do $$
declare c record; cid uuid;
begin
  for c in select * from consultas where cliente_id is null order by creado loop
    cid := buscar_cliente(c.email, c.telefono);
    if cid is null then
      insert into clientes (nombre, telefono, email, estado, origen, notas)
      values (c.nombre, c.telefono, c.email, 'prospecto', 'web', 'Prospecto desde el formulario de la web')
      returning id into cid;
    end if;
    update consultas set cliente_id = cid where id = c.id;
  end loop;
end $$;
