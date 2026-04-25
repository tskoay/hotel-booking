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

export type RoomListItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price_cents: number;
  max_occupancy: number;
  bed_config: string;
  room_type_images: RoomImageRow[];
};

export function RoomsList({ rooms }: { rooms: RoomListItem[] }) {
  if (rooms.length === 0) {
    return (
      <div className="border-border/40 flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-foreground text-base font-medium">No rooms match your filters.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try widening the price range or removing some amenities.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
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
                <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed">
                  {room.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
