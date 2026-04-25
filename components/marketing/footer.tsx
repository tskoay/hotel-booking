import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-border/40 bg-background border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold tracking-[0.2em] uppercase">Aurora</p>
          <p className="text-muted-foreground mt-3 text-sm">
            A boutique hotel in the heart of Sydney. Designed for travellers who want the city to
            disappear the moment they step inside.
          </p>
        </div>

        <div>
          <p className="text-foreground text-sm font-medium">Visit</p>
          <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
            <li>
              <Link href="/rooms" className="hover:text-foreground transition-colors">
                Rooms
              </Link>
            </li>
            <li>
              <Link href="/#amenities" className="hover:text-foreground transition-colors">
                Amenities
              </Link>
            </li>
            <li>
              <Link href="/#location" className="hover:text-foreground transition-colors">
                Location
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-foreground text-sm font-medium">Contact</p>
          <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
            <li>1 Macquarie St, Sydney NSW 2000</li>
            <li>+61 2 0000 0000</li>
            <li>stay@aurorahotel.example</li>
          </ul>
        </div>
      </div>
      <div className="border-border/40 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs">
          <span>© {new Date().getFullYear()} Hotel Aurora</span>
          <span>Built with Next.js + Supabase</span>
        </div>
      </div>
    </footer>
  );
}
