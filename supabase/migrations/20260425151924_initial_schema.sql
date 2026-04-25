-- Initial schema for the public-facing room inventory.
--
-- Tables:
--   amenities             -- global list of amenities (wifi, breakfast, etc.)
--   room_types            -- public room categories with pricing and copy
--   room_type_amenities   -- many-to-many join
--   room_type_images      -- ordered photos per room type, paths in Supabase Storage
--   rooms                 -- physical room inventory (admin-only; no public RLS)
--
-- RLS posture:
--   * Public/anon: SELECT on amenities, active room_types, and rows joined
--     to active room_types (room_type_amenities, room_type_images).
--   * Service-role bypasses RLS (used by future admin server actions).
--   * `rooms` has RLS enabled with NO policies → no client can read it;
--     only the service-role admin client can. Customers see room_types,
--     never the underlying physical inventory.

-- Extensions ----------------------------------------------------------------

-- gen_random_uuid() ships in pgcrypto, which is enabled by default on Supabase.
-- btree_gist is required by the bookings exclusion constraint in Phase 3.
-- Enable it here so it's a one-time concern.
create extension if not exists btree_gist;

-- Shared updated_at trigger -------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- amenities -----------------------------------------------------------------

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger amenities_set_updated_at
before update on public.amenities
for each row execute function public.set_updated_at();

alter table public.amenities enable row level security;

create policy "amenities are public"
on public.amenities
for select
to anon, authenticated
using (true);

-- room_types ----------------------------------------------------------------

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  base_price_cents integer not null check (base_price_cents > 0),
  max_occupancy integer not null check (max_occupancy > 0),
  bed_config text not null,
  size_sqm integer check (size_sqm > 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  featured_sort_order integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index room_types_active_sort_idx
on public.room_types (sort_order)
where is_active;

create index room_types_featured_idx
on public.room_types (featured_sort_order)
where is_featured and is_active;

create trigger room_types_set_updated_at
before update on public.room_types
for each row execute function public.set_updated_at();

alter table public.room_types enable row level security;

create policy "active room_types are public"
on public.room_types
for select
to anon, authenticated
using (is_active = true);

-- room_type_amenities (join) -----------------------------------------------

create table public.room_type_amenities (
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (room_type_id, amenity_id)
);

alter table public.room_type_amenities enable row level security;

create policy "room_type_amenities readable for active types"
on public.room_type_amenities
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.room_types rt
    where rt.id = room_type_amenities.room_type_id
      and rt.is_active
  )
);

-- room_type_images ----------------------------------------------------------

create table public.room_type_images (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index room_type_images_room_type_sort_idx
on public.room_type_images (room_type_id, sort_order);

create trigger room_type_images_set_updated_at
before update on public.room_type_images
for each row execute function public.set_updated_at();

alter table public.room_type_images enable row level security;

create policy "room_type_images readable for active types"
on public.room_type_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.room_types rt
    where rt.id = room_type_images.room_type_id
      and rt.is_active
  )
);

-- rooms (physical inventory; admin-only) -----------------------------------

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  -- restrict on delete: physical rooms with bookings shouldn't disappear
  -- because someone soft-deleted a room_type. soft-delete via is_active instead.
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  room_number text not null unique,
  floor integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rooms_room_type_idx on public.rooms (room_type_id);

create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

alter table public.rooms enable row level security;

-- No policies → service-role only.
