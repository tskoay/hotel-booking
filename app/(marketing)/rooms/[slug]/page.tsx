import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RoomCarousel } from "@/components/marketing/room-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { amenityIconMap } from "@/lib/amenity-icons";
import { formatPrice } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: room } = await supabase
    .from("room_types")
    .select("name, description, room_type_images (storage_path, sort_order)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!room) return { title: "Room not found" };

  const cover = room.room_type_images
    ? [...room.room_type_images].sort((a, b) => a.sort_order - b.sort_order)[0]
    : null;
  const ogImage = cover ? publicImageUrl(cover.storage_path) : null;

  return {
    title: room.name,
    description: room.description,
    openGraph: {
      title: `${room.name} · Hotel Aurora`,
      description: room.description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function RoomDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("room_types")
    .select(
      `id, slug, name, description, base_price_cents, max_occupancy, bed_config, size_sqm,
       room_type_images (storage_path, alt_text, sort_order),
       room_type_amenities (amenities (id, name, icon))`,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!room) notFound();

  const amenities = room.room_type_amenities.flatMap((j) => (j.amenities ? [j.amenities] : []));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Link
        href="/rooms"
        className="text-muted-foreground hover:text-foreground mb-6 inline-block text-sm font-medium transition-colors"
      >
        ← All rooms
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <RoomCarousel images={room.room_type_images} />

          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
              Hotel Aurora
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{room.name}</h1>
            <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>{room.bed_config}</span>
              <span aria-hidden>·</span>
              <span>Sleeps {room.max_occupancy}</span>
              {room.size_sqm ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{room.size_sqm} sqm</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="text-foreground text-base leading-relaxed">{room.description}</p>
          </div>

          {amenities.length > 0 ? (
            <div>
              <h2 className="text-foreground mb-4 text-lg font-semibold">In this room</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((a) => {
                  const Icon = a.icon ? amenityIconMap[a.icon] : null;
                  return (
                    <div
                      key={a.id}
                      className="border-border/40 bg-background flex items-center gap-3 rounded-lg border p-3"
                    >
                      {Icon ? <Icon className="text-muted-foreground h-4 w-4 shrink-0" /> : null}
                      <span className="text-sm font-medium">{a.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-foreground text-3xl font-semibold">
                  {formatPrice(room.base_price_cents)}
                </span>
                <span className="text-muted-foreground text-sm">/night</span>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">
                Free cancellation up to 48 hours before check-in. Taxes calculated at booking.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href={`/book?room_type=${room.slug}`}>Check availability</Link>
              </Button>
              <p className="text-muted-foreground mt-3 text-center text-xs">
                You won&rsquo;t be charged until your stay is confirmed.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
