"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/format";

const PRICE_FLOOR = 100;
const PRICE_CEILING = 1500;

type Amenity = { id: string; name: string };

type Props = {
  allAmenities: Amenity[];
  defaultMaxPrice: number;
  defaultMinOccupancy: number;
  defaultAmenities: string[];
};

export function RoomsFilters({
  allAmenities,
  defaultMaxPrice,
  defaultMinOccupancy,
  defaultAmenities,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function pushParams(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    updater(params);
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function onPriceCommit(values: number[]) {
    pushParams((p) => {
      const max = values[0];
      if (max >= PRICE_CEILING) p.delete("max_price");
      else p.set("max_price", String(max));
    });
  }

  function onOccupancyChange(value: number) {
    pushParams((p) => {
      if (value <= 1) p.delete("min_occupancy");
      else p.set("min_occupancy", String(value));
    });
  }

  function toggleAmenity(amenityId: string, checked: boolean) {
    pushParams((p) => {
      const current = new Set(defaultAmenities);
      if (checked) current.add(amenityId);
      else current.delete(amenityId);
      if (current.size === 0) p.delete("amenities");
      else p.set("amenities", Array.from(current).join(","));
    });
  }

  function clearFilters() {
    startTransition(() => router.push(pathname));
  }

  const hasFilters =
    defaultMaxPrice < PRICE_CEILING || defaultMinOccupancy > 1 || defaultAmenities.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">Filters</h2>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-foreground text-sm font-medium">Max price</p>
          <span className="text-muted-foreground text-xs">
            up to {formatPrice(defaultMaxPrice * 100)}
          </span>
        </div>
        <Slider
          defaultValue={[defaultMaxPrice]}
          min={PRICE_FLOOR}
          max={PRICE_CEILING}
          step={50}
          onValueCommit={onPriceCommit}
        />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{formatPrice(PRICE_FLOOR * 100)}</span>
          <span>{formatPrice(PRICE_CEILING * 100)}+</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-foreground text-sm font-medium">Min guests</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onOccupancyChange(n)}
              className={
                defaultMinOccupancy === n
                  ? "bg-foreground text-background flex-1 rounded-md px-3 py-2 text-sm font-medium"
                  : "border-border/60 hover:bg-muted text-foreground flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
              }
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-foreground text-sm font-medium">Amenities</p>
        <div className="space-y-2">
          {allAmenities.map((a) => {
            const checked = defaultAmenities.includes(a.id);
            return (
              <label key={a.id} className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => toggleAmenity(a.id, c === true)}
                />
                <span className="text-foreground">{a.name}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
