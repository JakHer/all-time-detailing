create extension if not exists pgcrypto;

create type public.booking_status as enum (
  'Nowa',
  'Potwierdzona',
  'W realizacji',
  'Gotowa do odbioru',
  'Anulowana'
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  make text not null,
  model text not null,
  registration text not null,
  production_year integer,
  color text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registration)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  duration_minutes integer not null default 60,
  base_price numeric(10, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  price numeric(10, 2) not null default 0,
  status public.booking_status not null default 'Nowa',
  bay text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_scheduled_at_idx on public.bookings (scheduled_at);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists vehicles_client_id_idx on public.vehicles (client_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

create or replace trigger vehicles_set_updated_at
before update on public.vehicles
for each row
execute function public.set_updated_at();

create or replace trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

create or replace trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.vehicles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

create policy "Allow public read access to clients"
on public.clients
for select
using (true);

create policy "Allow public write access to clients"
on public.clients
for all
using (true)
with check (true);

create policy "Allow public read access to vehicles"
on public.vehicles
for select
using (true);

create policy "Allow public write access to vehicles"
on public.vehicles
for all
using (true)
with check (true);

create policy "Allow public read access to services"
on public.services
for select
using (true);

create policy "Allow public write access to services"
on public.services
for all
using (true)
with check (true);

create policy "Allow public read access to bookings"
on public.bookings
for select
using (true);

create policy "Allow public write access to bookings"
on public.bookings
for all
using (true)
with check (true);

insert into public.services (name, description, duration_minutes, base_price)
values
  ('Detailing wnętrza premium', 'Dogłębne czyszczenie i zabezpieczenie wnętrza.', 240, 1150),
  ('Korekta lakieru dwuetapowa', 'Wydobycie głębi koloru i usunięcie zarysowań.', 480, 3600),
  ('Pakiet showroom + ceramika', 'Przygotowanie show-car i zabezpieczenie powłoką ceramiczną.', 360, 2800),
  ('Mycie detailingowe + zabezpieczenie szyb', 'Bezpieczne mycie i hydrofobizacja szyb.', 150, 620)
on conflict (name) do nothing;