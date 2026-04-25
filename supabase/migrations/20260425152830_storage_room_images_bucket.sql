-- Storage bucket for room photos.
--
-- Public read because marketing photos are meant to be displayed
-- via <img>/next/image and need cache-friendly URLs. Writes happen
-- only via the service-role admin client (Phase 4 admin UI), so
-- there is no public INSERT/UPDATE/DELETE policy.
--
-- File-size limit: 5 MB. Real photos in Phase 6 should be optimized
-- before upload; next/image handles client-side responsive sizing.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'room-images',
  'room-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public SELECT on objects in this bucket only.
-- (RLS is already enabled on storage.objects by Supabase.)
create policy "room-images public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'room-images');
