import Link from "next/link";

import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/rooms", label: "Rooms" },
  { href: "/#amenities", label: "Amenities" },
  { href: "/#location", label: "Location" },
];

export function Header() {
  return (
    <header className="border-border/40 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-[0.2em] uppercase">
          Aurora
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm" variant="outline">
          <Link href="/signin">Sign in</Link>
        </Button>
      </div>
    </header>
  );
}
