-- Seed data for the public-facing room inventory.
--
-- Applied by `supabase db push --include-seed` after migrations.
-- All inserts are idempotent so re-running is safe; never run truncates here.
--
-- Image paths point at `room-images/<slug>/<n>.jpg`. The actual files are
-- not committed; upload them via the dashboard or via the admin client
-- in Phase 6 polish. The UI should fall back gracefully when the file is
-- missing (placeholder skeleton).

-- amenities ------------------------------------------------------------------

insert into public.amenities (name, icon) values
  ('Free Wi-Fi',         'wifi'),
  ('Breakfast included', 'coffee'),
  ('Parking',            'car'),
  ('Gym access',         'dumbbell'),
  ('Pool access',        'waves'),
  ('Pet friendly',       'paw-print'),
  ('Air conditioning',   'wind'),
  ('Smart TV',           'tv'),
  ('Mini bar',           'wine'),
  ('Room service',       'concierge-bell')
on conflict (name) do nothing;

-- room_types -----------------------------------------------------------------

insert into public.room_types (
  slug, name, description,
  base_price_cents, max_occupancy, bed_config, size_sqm,
  is_active, is_featured, featured_sort_order, sort_order
) values
  (
    'standard-king',
    'Standard King',
    'Comfortable king-bed room with city views and a writing desk. Ideal for solo travellers and short stays.',
    18900, 2, '1 King bed', 28,
    true, true, 1, 10
  ),
  (
    'deluxe-twin',
    'Deluxe Twin',
    'Spacious twin-bedded room with two work areas. Suited for friends or business colleagues sharing a stay.',
    22900, 2, '2 Twin beds', 32,
    true, false, null, 20
  ),
  (
    'executive-suite',
    'Executive Suite',
    'Suite with a separate lounge area, bathtub, and premium amenities. Sleeps up to three with a fold-out sofa.',
    38900, 3, '1 King bed + sofa bed', 52,
    true, true, 2, 30
  ),
  (
    'penthouse',
    'Penthouse',
    'Two-bedroom penthouse with private terrace, kitchenette, and panoramic skyline views.',
    89000, 4, '1 King + 1 Queen', 110,
    true, true, 3, 40
  )
on conflict (slug) do nothing;

-- room_type_amenities (join) -------------------------------------------------

-- Standard King: basics
insert into public.room_type_amenities (room_type_id, amenity_id)
select rt.id, a.id
from public.room_types rt, public.amenities a
where rt.slug = 'standard-king'
  and a.name in ('Free Wi-Fi', 'Breakfast included', 'Air conditioning', 'Smart TV')
on conflict do nothing;

-- Deluxe Twin: basics + parking
insert into public.room_type_amenities (room_type_id, amenity_id)
select rt.id, a.id
from public.room_types rt, public.amenities a
where rt.slug = 'deluxe-twin'
  and a.name in ('Free Wi-Fi', 'Breakfast included', 'Air conditioning', 'Smart TV', 'Parking')
on conflict do nothing;

-- Executive Suite: + mini bar + room service
insert into public.room_type_amenities (room_type_id, amenity_id)
select rt.id, a.id
from public.room_types rt, public.amenities a
where rt.slug = 'executive-suite'
  and a.name in (
    'Free Wi-Fi', 'Breakfast included', 'Air conditioning', 'Smart TV',
    'Parking', 'Mini bar', 'Room service'
  )
on conflict do nothing;

-- Penthouse: everything
insert into public.room_type_amenities (room_type_id, amenity_id)
select rt.id, a.id
from public.room_types rt, public.amenities a
where rt.slug = 'penthouse'
  and a.name in (
    'Free Wi-Fi', 'Breakfast included', 'Air conditioning', 'Smart TV',
    'Parking', 'Mini bar', 'Room service', 'Gym access', 'Pool access'
  )
on conflict do nothing;

-- room_type_images -----------------------------------------------------------

-- 4 placeholder image rows per room type. The seed only runs once per
-- room type — if any image already exists for that room, skip insertion.
-- This keeps re-running the seed idempotent without a unique constraint.
do $$
declare
  rt record;
  i integer;
begin
  for rt in select id, slug, name from public.room_types loop
    if not exists (
      select 1 from public.room_type_images where room_type_id = rt.id
    ) then
      for i in 1..4 loop
        insert into public.room_type_images (
          room_type_id, storage_path, alt_text, sort_order
        ) values (
          rt.id,
          rt.slug || '/' || i || '.jpg',
          rt.name || ' photo ' || i,
          i - 1
        );
      end loop;
    end if;
  end loop;
end$$;
