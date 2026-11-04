-- =============================================================================
-- Servicios HK — Esquema de base de datos para Supabase (PostgreSQL)
-- =============================================================================
-- Cómo usar este archivo:
--   1. Abre tu proyecto en https://app.supabase.com
--   2. Ve a "SQL Editor" → "New query"
--   3. Pega el contenido completo de este archivo y ejecútalo (Run)
--   4. Verifica en "Table Editor" que se crearon las tablas: admin_users,
--      quotes y contact_messages.
--
-- Este script es idempotente: puede ejecutarse más de una vez sin duplicar
-- datos ni fallar si los objetos ya existen.
-- =============================================================================

-- Extensión necesaria para generar UUIDs con gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tabla: admin_users
-- Reemplaza el modelo Mongoose "User". Guarda las cuentas del panel de
-- administración (no los clientes finales, que no requieren cuenta).
-- -----------------------------------------------------------------------------
create table if not exists admin_users (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  email         text not null unique,
  password_hash text not null,
  role          text not null default 'admin' check (role in ('admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Tabla: quotes
-- Reemplaza el modelo Mongoose "Quote". Los productos cotizados se guardan
-- como JSONB porque provienen del catálogo Excel (no de una tabla propia),
-- igual que en la versión anterior con Mongoose (array embebido).
-- -----------------------------------------------------------------------------
create table if not exists quotes (
  id                  uuid primary key default gen_random_uuid(),
  numero_cotizacion   text unique,
  rut_empresa         text not null,
  razon_social        text not null,
  nombre_contacto     text not null,
  telefono_contacto   text not null,
  direccion           text not null,
  email               text not null,
  region              text not null,
  provincia           text not null,
  comuna              text not null,
  instrucciones       text not null default '',
  productos           jsonb not null default '[]'::jsonb,
  estado              text not null default 'pendiente'
                        check (estado in ('pendiente', 'revisada', 'enviada', 'rechazada')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_quotes_estado on quotes (estado);
create index if not exists idx_quotes_created_at on quotes (created_at desc);

-- Secuencia para generar números de cotización legibles: HK-2026-0001
create sequence if not exists quotes_numero_seq;

create or replace function set_numero_cotizacion()
returns trigger as $$
begin
  if new.numero_cotizacion is null then
    new.numero_cotizacion := 'HK-' || extract(year from now()) || '-' ||
                              lpad(nextval('quotes_numero_seq')::text, 4, '0');
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_numero_cotizacion on quotes;
create trigger trg_set_numero_cotizacion
  before insert on quotes
  for each row execute function set_numero_cotizacion();

create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_quotes_touch_updated_at on quotes;
create trigger trg_quotes_touch_updated_at
  before update on quotes
  for each row execute function touch_updated_at();

-- -----------------------------------------------------------------------------
-- Tabla: contact_messages
-- Reemplaza el modelo Mongoose "Contact".
-- -----------------------------------------------------------------------------
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  email       text not null,
  telefono    text,
  asunto      text not null,
  mensaje     text not null,
  leido       boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_contact_messages_leido on contact_messages (leido);
create index if not exists idx_contact_messages_created_at on contact_messages (created_at desc);

-- -----------------------------------------------------------------------------
-- Tabla: heartbeat
-- Una única fila que se sobrescribe cada vez que /api/health se consulta.
-- Su único propósito es generar una escritura real en la base de datos —
-- Supabase pausa los proyectos del plan gratuito tras 7 días sin actividad,
-- y una simple lectura no siempre cuenta de forma confiable; una escritura
-- (INSERT/UPDATE) sí. No almacena información de negocio, no crece con el
-- tiempo (siempre 1 fila) y no requiere mantenimiento.
-- -----------------------------------------------------------------------------
create table if not exists heartbeat (
  id         smallint primary key default 1,
  pinged_at  timestamptz not null default now(),
  constraint heartbeat_single_row check (id = 1)
);

insert into heartbeat (id, pinged_at)
values (1, now())
on conflict (id) do nothing;

alter table heartbeat enable row level security;

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- El backend accede con la "service role key", que ignora RLS. Se habilita
-- igualmente por buenas prácticas de seguridad, dejando las tablas cerradas
-- a cualquier acceso directo desde el navegador (anon key).
-- -----------------------------------------------------------------------------
alter table admin_users enable row level security;
alter table quotes enable row level security;
alter table contact_messages enable row level security;

-- No se crean políticas para el rol "anon": por diseño, todo el acceso a
-- datos pasa por la API de Express usando la service role key.
