-- OBRAX · Vincular consultas de la web con el cliente y el presupuesto generados
alter table consultas
  add column if not exists cliente_id uuid references clientes(id) on delete set null,
  add column if not exists presupuesto_id uuid references presupuestos(id) on delete set null,
  add column if not exists actualizado timestamptz not null default now();
create index if not exists consultas_estado on consultas (estado, creado desc);
