/**
 * Build a public URL for a file in a public Supabase Storage bucket.
 *
 * The room-images bucket is public (see migration
 * 20260425152830_storage_room_images_bucket.sql), so plain URLs work
 * with browser caching and CDNs. Use the admin client + signed URLs
 * if a private bucket is added later.
 */
export function publicImageUrl(path: string, bucket = "room-images"): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required to build a storage URL");
  }
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
