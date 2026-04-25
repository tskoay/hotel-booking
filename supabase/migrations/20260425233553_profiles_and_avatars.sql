-- Profiles + auth wiring + avatars storage bucket.
--
-- After this migration runs, every auth.users insert automatically creates
-- a public.profiles row via trigger. Profiles RLS lets users read/update
-- their own row; admins are handled by the service-role admin client
-- (Phase 4 admin UI). Avatars bucket is public for display, with per-user
-- folder writes enforced at the storage.objects level.
--
-- Loyalty columns (loyalty_tier_id, loyalty_points) intentionally deferred
-- to Phase 5 alongside the loyalty_tiers table — adds them to profiles via
-- ALTER TABLE then.

-- Role enum -----------------------------------------------------------------

create type public.user_role as enum ('customer', 'admin');

-- profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: read own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles: update own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Note: no INSERT policy. The handle_new_user() trigger below runs as
-- SECURITY DEFINER and bypasses RLS, which is the only path that should
-- create profiles rows. Phase 4 admin will use the service-role client.

-- Auto-create profile on signup --------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data->>'full_name'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- avatars storage bucket ----------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  1048576, -- 1 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public SELECT.
create policy "avatars: public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

-- Authenticated users can write only inside a folder named with their uid.
-- Path convention: <user_id>/<filename>
create policy "avatars: own folder insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars: own folder update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars: own folder delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
