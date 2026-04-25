import { AmenitiesGrid } from "@/components/marketing/amenities-grid";
import { FeaturedRooms } from "@/components/marketing/featured-rooms";
import { Hero } from "@/components/marketing/hero";
import { Location } from "@/components/marketing/location";
import { Testimonials } from "@/components/marketing/testimonials";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const [featuredQuery, amenitiesQuery] = await Promise.all([
    supabase
      .from("room_types")
      .select(
        `id, slug, name, description, base_price_cents, max_occupancy, bed_config,
         room_type_images (storage_path, alt_text, sort_order)`,
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("featured_sort_order", { ascending: true }),
    supabase.from("amenities").select("id, name, icon").order("name"),
  ]);

  return (
    <>
      <Hero />
      <FeaturedRooms rooms={featuredQuery.data ?? []} />
      <AmenitiesGrid amenities={amenitiesQuery.data ?? []} />
      <Testimonials />
      <Location />
    </>
  );
}
