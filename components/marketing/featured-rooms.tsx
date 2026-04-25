import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";

import { RoomImage } from "./room-image";

type RoomImageRow = {
  storage_path: string;
  alt_text: string;
  sort_order: number;
};

export type FeaturedRoom = {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price_cents: number;
  max_occupancy: number;
  bed_config: string;
  room_type_images: RoomImageRow[];
};

export function FeaturedRooms({ rooms }: { rooms: FeaturedRoom[] }) {
  if (rooms.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
            Featured
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Stay with us</h2>
        </div>
        <Link
          href="/rooms"
          className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:inline-flex"
        >
          View all rooms →
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {rooms.map((room) => {
          const cover = [...room.room_type_images].sort((a, b) => a.sort_order - b.sort_order)[0];
          return (
            <Link key={room.id} href={`/rooms/${room.slug}`} className="group">
              <Card className="overflow-hidden p-0 transition-shadow group-hover:shadow-md">
                <div className="aspect-[4/3] overflow-hidden">
                  {cover ? (
                    <RoomImage
                      src={publicImageUrl(cover.storage_path)}
                      alt={cover.alt_text}
                      width={800}
                      height={600}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="bg-muted h-full w-full" aria-hidden />
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold">{room.name}</h3>
                    <span className="text-foreground font-medium whitespace-nowrap">
                      {formatPrice(room.base_price_cents)}
                      <span className="text-muted-foreground text-xs"> /night</span>
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {room.bed_config} · sleeps {room.max_occupancy}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
