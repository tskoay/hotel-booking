import { Clock, Mail, MapPin, Phone } from "lucide-react";

const details = [
  { Icon: MapPin, label: "1 Macquarie St, Sydney NSW 2000" },
  { Icon: Phone, label: "+61 2 0000 0000" },
  { Icon: Mail, label: "stay@aurorahotel.example" },
  { Icon: Clock, label: "Check-in 3pm · Check-out 11am" },
];

export function Location() {
  return (
    <section id="location" className="bg-muted/30 border-border/40 border-y">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
            Find us
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Sydney CBD</h2>
          <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed">
            A short walk from Circular Quay, the Royal Botanic Garden, and the Opera House. Trains,
            ferries, and a properly good coffee are all within four blocks.
          </p>
          <ul className="mt-8 space-y-3">
            {details.map(({ Icon, label }) => (
              <li key={label} className="text-foreground flex items-center gap-3 text-sm">
                <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-muted border-border/40 aspect-[4/3] rounded-lg border">
          {/* Map embed placeholder. Replace with a real map (Mapbox / Google Static) in Phase 6. */}
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground text-sm tracking-widest uppercase">Map</span>
          </div>
        </div>
      </div>
    </section>
  );
}
