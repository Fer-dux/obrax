-- OBRAX · Consultas desde el formulario de la web
create table if not exists consultas (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  telefono text not null default '' check (char_length(telefono) <= 40),
  email text not null default '' check (char_length(email) <= 160),
  necesita text not null default '' check (char_length(necesita) <= 40),
  obra text not null default '' check (char_length(obra) <= 200),
  mensaje text not null default '' check (char_length(mensaje) <= 2000),
  origen text not null default 'web',
  estado text not null default 'nueva' check (estado in ('nueva', 'en_curso', 'presupuestada', 'descartada')),
  atendida_por uuid references perfiles(id) on delete set null,
  constraint consultas_contacto check (telefono <> '' or email <> '')
);
create index if not exists consultas_creado on consultas (creado desc);

alter table consultas enable row level security;

-- La web (anónima) solo puede INSERTAR, nunca leer.
create policy consultas_insert_web on consultas for insert to anon
  with check (estado = 'nueva' and atendida_por is null and origen = 'web');
-- El equipo logueado las ve y las gestiona.
create policy consultas_equipo on consultas for all to authenticated using (true) with check (true);
