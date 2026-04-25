"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Props = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackClassName?: string;
};

/**
 * next/image with a graceful fallback for Phase 1, while real photos
 * aren't uploaded to the room-images bucket yet. Renders a muted
 * placeholder block when the image fails to load (404, network, etc.).
 */
export function RoomImage({ src, alt, className, fallbackClassName, ...rest }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("bg-muted flex items-center justify-center", className, fallbackClassName)}
      >
        <span className="text-muted-foreground text-xs tracking-widest uppercase">
          Photo coming soon
        </span>
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} className={className} onError={() => setErrored(true)} {...rest} />
  );
}
