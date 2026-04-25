import { amenityIconMap } from "@/lib/amenity-icons";

export type Amenity = {
  id: string;
  name: string;
  icon: string | null;
};

export function AmenitiesGrid({ amenities }: { amenities: Amenity[] }) {
  return (
    <section id="amenities" className="bg-muted/30 border-border/40 border-y">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-10">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
            What&apos;s inside
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Amenities</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {amenities.map((a) => {
            const Icon = a.icon ? amenityIconMap[a.icon] : null;
            return (
              <div
                key={a.id}
                className="border-border/40 bg-background flex items-center gap-3 rounded-lg border p-4"
              >
                {Icon ? <Icon className="text-muted-foreground h-5 w-5 shrink-0" /> : null}
                <span className="text-sm font-medium">{a.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
