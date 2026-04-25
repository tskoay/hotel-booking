import Link from "next/link";

import { AvailabilitySearch } from "@/components/marketing/availability-search";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="from-background via-background to-muted/40 absolute inset-0 -z-10 bg-gradient-to-b" />
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28 md:py-32">
        <div className="max-w-3xl">
          <p className="text-muted-foreground mb-4 text-xs font-medium tracking-[0.3em] uppercase">
            Sydney · est. 2024
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl">
            A new way to stay.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg sm:text-xl">
            Hotel Aurora is a boutique stay built around quiet rooms, slow mornings, and a city
            that&rsquo;s easy to step into when you&rsquo;re ready.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/rooms">Browse rooms</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#location">Visit us</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <AvailabilitySearch />
        </div>
      </div>
    </section>
  );
}
