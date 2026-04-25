import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-muted-foreground mb-3 text-sm font-medium tracking-widest uppercase">
        Coming soon
      </p>
      <h1 className="mb-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        A new way to stay.
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md text-base sm:text-lg">
        Booking goes live shortly. Reserve your room and earn points from your first stay.
      </p>
      <Button size="lg" disabled>
        Book a room
      </Button>
    </main>
  );
}
