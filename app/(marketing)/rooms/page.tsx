import type { Metadata } from "next";

import { AvailabilitySearch } from "@/components/marketing/availability-search";
import { RoomsFilters } from "@/components/marketing/rooms-filters";
import { RoomsList } from "@/components/marketing/rooms-list";
import { availabilitySearchSchema } from "@/lib/schemas/availability";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rooms",
  description: "Browse rooms at Hotel Aurora — boutique stays in Sydney CBD.",
};

const PRICE_CEILING = 1500;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function RoomsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = availabilitySearchSchema.safeParse({
    check_in: firstString(params.check_in),
    check_out: firstString(params.check_out),
    guests: firstString(params.guests),
  });

  const maxPriceRaw = firstString(params.max_price);
  const minOccupancyRaw = firstString(params.min_occupancy);
  const amenitiesRaw = firstString(params.amenities);

  const maxPriceCents = maxPriceRaw ? Number(maxPriceRaw) * 100 : null;
  const minOccupancy = minOccupancyRaw ? Number(minOccupancyRaw) : null;
  const amenityIds = amenitiesRaw ? amenitiesRaw.split(",").filter(Boolean) : [];
  const guests = search.success ? search.data.guests : undefined;

  const supabase = await createClient();
  const [roomsQuery, amenitiesQuery] = await Promise.all([
    supabase
      .from("room_types")
      .select(
        `id, slug, name, description, base_price_cents, max_occupancy, bed_config,
         room_type_images (storage_path, alt_text, sort_order),
         room_type_amenities (amenity_id)`,
      )
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("amenities").select("id, name, icon").order("name"),
  ]);

  const allRooms = roomsQuery.data ?? [];
  const allAmenities = amenitiesQuery.data ?? [];

  const filtered = allRooms.filter((room) => {
    if (maxPriceCents && room.base_price_cents > maxPriceCents) return false;
    if (minOccupancy && room.max_occupancy < minOccupancy) return false;
    if (guests && room.max_occupancy < guests) return false;
    if (amenityIds.length > 0) {
      const roomAmenityIds = new Set(room.room_type_amenities.map((j) => j.amenity_id));
      if (!amenityIds.every((id) => roomAmenityIds.has(id))) return false;
    }
    return true;
  });

  return (
    <>
      <section className="border-border/40 bg-muted/30 border-b">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          <p className="text-muted-foreground mb-4 text-xs font-medium tracking-[0.3em] uppercase">
            Find your stay
          </p>
          <AvailabilitySearch defaultValues={search.success ? search.data : undefined} />
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Rooms</h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} of {allRooms.length} {allRooms.length === 1 ? "room" : "rooms"}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          <aside className="md:sticky md:top-20 md:self-start">
            <RoomsFilters
              allAmenities={allAmenities}
              defaultMaxPrice={maxPriceCents ? maxPriceCents / 100 : PRICE_CEILING}
              defaultMinOccupancy={minOccupancy ?? 1}
              defaultAmenities={amenityIds}
            />
          </aside>
          <RoomsList rooms={filtered} />
        </div>
      </div>
    </>
  );
}
