// Static testimonials for Phase 1. The `testimonials` table comes in
// Phase 4 with admin CMS for rotating real reviews.
const testimonials = [
  {
    body: "The room was so quiet I forgot I was in the middle of the city. Slept twelve hours and didn't see a soul until breakfast. That's the goal, isn't it?",
    author: "Maya R.",
    role: "Stayed two nights, Standard King",
  },
  {
    body: "We came in for a wedding weekend and barely left the suite. The bath, the terrace, the breakfast — everything in proportion. Worth the upgrade.",
    author: "Daniel & Pip",
    role: "Stayed four nights, Executive Suite",
  },
  {
    body: "Staff remembered my coffee order on day two. Small thing, but it's the difference between a hotel and somewhere you'd come back to.",
    author: "Aleks K.",
    role: "Stayed one night, Deluxe Twin",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-10">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          Said about us
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          From people who stayed
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.author}
            className="border-border/40 bg-background flex flex-col rounded-lg border p-6"
          >
            <blockquote className="text-foreground flex-1 text-base leading-relaxed">
              &ldquo;{t.body}&rdquo;
            </blockquote>
            <figcaption className="mt-6">
              <p className="text-foreground text-sm font-medium">{t.author}</p>
              <p className="text-muted-foreground text-xs">{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
