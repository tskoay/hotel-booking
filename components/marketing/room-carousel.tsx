"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { publicImageUrl } from "@/lib/storage";

import { RoomImage } from "./room-image";

type ImageRow = {
  storage_path: string;
  alt_text: string;
  sort_order: number;
};

export function RoomCarousel({ images }: { images: ImageRow[] }) {
  if (images.length === 0) {
    return <div className="bg-muted aspect-[3/2] w-full rounded-lg" aria-hidden />;
  }

  const ordered = [...images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Carousel className="w-full" opts={{ align: "start", loop: true }}>
      <CarouselContent>
        {ordered.map((img) => (
          <CarouselItem key={img.storage_path}>
            <div className="aspect-[3/2] overflow-hidden rounded-lg">
              <RoomImage
                src={publicImageUrl(img.storage_path)}
                alt={img.alt_text}
                width={1200}
                height={800}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {ordered.length > 1 ? (
        <>
          <CarouselPrevious className="left-3" />
          <CarouselNext className="right-3" />
        </>
      ) : null}
    </Carousel>
  );
}
