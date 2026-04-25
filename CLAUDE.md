# Hotel Booking Platform — Project Context

This file is read by Claude Code at the start of every session. Keep it current.

---

## Project

A hotel booking web app: marketing landing page, room booking with payment, customer accounts, admin console, and a loyalty program. Single property, single currency (USD), English only for v1.

Full development plan lives at `docs/plan.md`. Always read it before starting a new phase.

---

## Tech Stack (do not deviate without asking)

- **Framework:** Next.js 14+ (App Router, TypeScript, strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (Postgres) — use the `@supabase/ssr` package, not the deprecated auth-helpers
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **File storage:** Supabase Storage
- **Payments:** Stripe (Payment Element, server-created PaymentIntents)
- **Email:** Resend
- **Forms / validation:** React Hook Form + Zod (shared schemas client + server)
- **Server state:** TanStack Query for client-side caching only; prefer React Server Components for data loading
- **Hosting:** Vercel
- **Errors:** Sentry

---

## Folder Conventions

```
/app
  /(marketing)/...      # public landing + room pages, SSR/ISR
  /(auth)/...           # signin, signup, reset flows
  /account/...          # protected: customer area
  /admin/...            # protected + role=admin
  /api/...              # webhooks and server-only endpoints
/components/ui          # shadcn primitives, do not edit by hand
/components/<feature>   # feature-scoped components
/lib
  /supabase/server.ts   # server client (cookies-aware)
  /supabase/client.ts   # browser client
  /supabase/admin.ts    # service-role client, server-only
  /supabase/proxy.ts    # session-refresh helper, called from /proxy.ts
  /stripe.ts
  /pricing.ts           # all price math, server-only
  /availability.ts      # all availability logic, server-only
  /loyalty.ts           # all loyalty math, server-only
/supabase
  /migrations/*.sql     # versioned schema changes
  /seed.sql
/types/database.ts      # generated, do not hand-edit
proxy.ts                # Next.js 16 file convention (replaces middleware.ts)
docs/
  plan.md               # full phased plan
  decisions.md          # log of choices made during build
```

---

## Non-Negotiable Rules

1. **Auth is checked server-side.** Client checks are for hiding UI only. Every protected route, server action, and API route re-verifies the session and role.
2. **RLS on every table from day one.** No exceptions. Write a policy when you create a table.
3. **Service-role key is server-only.** Never imported into a file under `/components` or anything that ships to the browser.
4. **Prices are computed server-side.** Never trust amounts from the client. Recompute on every booking and payment intent creation.
5. **Stripe webhook is the source of truth for booking confirmation.** Do not flip a booking to `confirmed` from the client.
6. **Verify Stripe webhook signatures.** Reject anything without a valid `Stripe-Signature` header.
7. **Database changes go through `/supabase/migrations/`.** Never modify schema only in the dashboard.
8. **Regenerate `types/database.ts` after every schema change** with `supabase gen types typescript`.
9. **Zod schemas are shared.** One schema per entity, imported by both client form and server action.
10. **No secrets in the repo.** `.env.local` only; document required vars in `.env.example`.

---

## Booking Logic Invariants

- A `room` (physical) cannot have two `bookings` whose date ranges overlap and whose status is in (`pending`, `confirmed`, `checked_in`).
- Use a Postgres exclusion constraint with `btree_gist` on `(room_id, daterange(check_in, check_out))` to enforce this at the DB level. Do not rely on application code alone.
- Availability checks and booking inserts run inside a single transaction (or a Postgres function).
- A booking goes `pending` → `confirmed` only via the Stripe webhook.
- Cancellation rules: free if > 48h before check-in, otherwise non-refundable. Configurable later, hardcoded for now.

---

## Loyalty Invariants

- Points are credited only when a booking reaches `completed` status (after check-out).
- Earn rate: `floor(total_cents / 100) * tier_multiplier`.
- Redemption: 1 point = $0.01, capped at 50% of booking total.
- Tier is recalculated from rolling 12-month points, not lifetime.
- Every points change writes a `loyalty_transactions` row. The `profiles.loyalty_points` column is a denormalized cache, never updated directly without a matching transaction.

---

## Current Status

- **Phase:** 0 — Foundation
- **Last completed:** (nothing yet — fresh repo)
- **Next task:** initialize Next.js, Tailwind, shadcn, Supabase clients, deploy to Vercel

Update this section at the end of every session.

---

## Session Workflow

At the start of every session:
1. Read this file and `docs/plan.md`.
2. Confirm which phase and task we're on (see "Current Status" above).
3. Summarize what you plan to do, then ask clarifying questions before writing code.
4. Wait for explicit approval before creating or modifying more than 3 files at once.

At the end of every session:
1. Update "Current Status" above.
2. Append any non-obvious decisions to `docs/decisions.md` with the date and reasoning.
3. Note any TODOs or known issues here under a "Known Issues" section.

---

## Known Issues

(none yet)

---

## Decisions Log Pointer

Anything that future-me would ask "why did we do it this way?" goes in `docs/decisions.md`. Examples: why we chose Resend over SendGrid, why bookings use exclusion constraints instead of advisory locks, why we picked a specific cancellation window.
