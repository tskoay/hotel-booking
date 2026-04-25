# Hotel Booking Platform — Development Plan

A phased plan for a hotel landing page with room booking, customer accounts, an admin console, and a loyalty program. Written so each phase produces a working, demoable slice and can be translated directly into code by an AI coding assistant.

---

## 1. Product Scope

**Customer-facing**
- Marketing landing page (hero, rooms, amenities, gallery, testimonials, CTA)
- Search availability by date range + guest count
- Room details with photos, amenities, price
- Booking flow with payment
- Customer account: profile, past/upcoming bookings, cancel booking
- Loyalty: earn points per stay, tier benefits, redeem for discounts

**Admin-facing**
- Dashboard (occupancy, revenue, upcoming arrivals)
- Manage rooms / room types / pricing / availability
- Manage bookings (view, modify, cancel, refund)
- Manage users and loyalty adjustments
- Content management for landing page copy and images

**Out of scope (v1)**
- Multi-property / multi-tenant
- Channel manager integrations (Booking.com, Expedia)
- Mobile native apps
- Multi-currency / multi-language

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) | SSR/ISR for SEO on landing pages, API routes for backend |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent components |
| Database | Supabase (Postgres) | Managed Postgres + RLS + realtime |
| Auth | Supabase Auth | Email/password, OAuth, magic link out of the box |
| File storage | Supabase Storage | Room images, user avatars |
| Payments | Stripe (Checkout or Payment Element) | Industry standard, hosted PCI compliance |
| Email | Resend (or Supabase SMTP) | Transactional emails |
| Hosting | Vercel | Native Next.js fit, preview deploys |
| Monitoring | Sentry + Vercel Analytics | Error tracking + perf |
| Forms / validation | React Hook Form + Zod | Type-safe forms, shared client/server schemas |
| State | React Server Components + TanStack Query for client cache | Minimal client state |

---

## 3. High-Level Architecture

```
Browser
  ├─ Next.js (Vercel)
  │   ├─ Public pages (SSR/ISR): /, /rooms, /rooms/[id]
  │   ├─ Auth pages: /signin, /signup
  │   ├─ Customer app: /account/*
  │   ├─ Admin app: /admin/*
  │   └─ API routes: /api/* (booking, payment webhooks, admin actions)
  │
  ├─ Supabase
  │   ├─ Postgres (with RLS policies)
  │   ├─ Auth (JWTs)
  │   └─ Storage (room images)
  │
  └─ Stripe (checkout + webhooks)
```

---

## 4. Database Schema (Supabase / Postgres)

All tables use `uuid` primary keys, `created_at`, `updated_at`. Row-Level Security enabled on every table.

### Core tables

- **profiles** — `id (FK auth.users)`, `full_name`, `phone`, `avatar_url`, `role` (`customer` | `admin`), `loyalty_tier_id`, `loyalty_points`
- **room_types** — `id`, `name`, `description`, `base_price_cents`, `max_occupancy`, `bed_config`, `size_sqm`, `is_active`
- **room_type_amenities** — join table to `amenities`
- **amenities** — `id`, `name`, `icon`
- **room_type_images** — `id`, `room_type_id`, `storage_path`, `alt_text`, `sort_order`
- **rooms** — physical room inventory: `id`, `room_type_id`, `room_number`, `floor`, `is_active`
- **bookings** — `id`, `user_id`, `room_id`, `room_type_id`, `check_in`, `check_out`, `guest_count`, `total_cents`, `currency`, `status` (`pending` | `confirmed` | `cancelled` | `checked_in` | `completed` | `refunded`), `stripe_payment_intent_id`, `notes`
- **booking_guests** — optional secondary guests on a booking
- **payments** — `id`, `booking_id`, `stripe_id`, `amount_cents`, `status`, `type` (`charge` | `refund`)

### Loyalty tables

- **loyalty_tiers** — `id`, `name` (Bronze/Silver/Gold/Platinum), `min_points`, `points_multiplier`, `perks_json`
- **loyalty_transactions** — `id`, `user_id`, `booking_id (nullable)`, `points_delta`, `reason` (`earn_stay` | `redeem` | `adjustment` | `expiry`), `notes`

### Content tables (admin-editable)

- **page_sections** — `id`, `slug`, `title`, `body_md`, `image_path`, `sort_order`, `is_published`
- **testimonials** — `id`, `author`, `body`, `rating`, `is_published`

### Key indexes
- `bookings (room_id, check_in, check_out)` for availability lookups
- `bookings (user_id, status)` for "my bookings"
- `loyalty_transactions (user_id, created_at desc)`

### RLS policy summary
- `profiles`: user can `select`/`update` their own row; admins all rows
- `bookings`: user can `select`/`insert` their own; admins all
- `room_types`, `rooms`, `amenities`, `page_sections`: public `select` where `is_active`/`is_published`; admin write
- `loyalty_transactions`: user reads own; only service role writes (called from server)

---

## 5. Authentication (Supabase Auth)

- Email + password as primary, with email verification
- Magic link as fallback
- Optional: Google OAuth (one-click signup is a conversion lever)
- Password reset flow via email
- `role` claim mirrored in `profiles.role`; admin gate is **server-side** (don't trust client claims)
- Middleware (`middleware.ts`) refreshes the Supabase session and protects `/account` and `/admin`
- Admin promotion is a manual SQL action in v1 — no self-service admin signup

---

## 6. Phased Development Plan

Each phase ends in a deployable, demoable state. Estimates assume one focused developer working with AI assistance.

### Phase 0 — Foundation (2–3 days)

**Goal:** empty app deployed, DB connected, CI green.

- Initialize Next.js + TypeScript + Tailwind + shadcn/ui
- Configure ESLint, Prettier, Husky pre-commit
- Create Supabase project; pull types with `supabase gen types typescript`
- Set up `.env.local`, `.env.example`, Vercel env vars
- Wire Supabase server + browser clients (with cookies for SSR)
- Deploy to Vercel; set up preview deploys on PRs
- Add Sentry

**Deliverable:** placeholder homepage live on a Vercel URL, Supabase connected.

---

### Phase 1 — Public Landing Page (3–5 days)

**Goal:** marketing site with browseable rooms.

- Layout: header (logo, nav, sign-in CTA), footer
- Sections: hero, featured rooms, amenities grid, gallery, testimonials, location/contact
- `/rooms` index — list all active room types with filters (price, occupancy, amenities)
- `/rooms/[id]` detail — image carousel, description, amenities, price, "Book now" CTA (gated to availability widget)
- Availability search bar (dates + guests) — wired to a server function that returns available room types for the range
- SEO: metadata, Open Graph, sitemap, robots.txt
- Image optimization via `next/image` + Supabase Storage public URLs

**DB writes needed:** none yet (read-only); seed script populates room types, images, amenities.

**Deliverable:** browseable hotel site, no accounts yet.

---

### Phase 2 — Authentication & Accounts (2–3 days)

**Goal:** users can sign up, sign in, manage profile.

- `/signup`, `/signin`, `/forgot-password`, `/reset-password`, `/auth/callback`
- On signup, trigger creates a `profiles` row (Postgres trigger or server action)
- Email verification required before booking
- Auth middleware protecting `/account/*`
- `/account` profile page: edit name, phone, avatar (Supabase Storage upload)
- Sign out everywhere
- Email templates customized in Supabase dashboard

**Deliverable:** users can self-serve accounts; profile data persists.

---

### Phase 3 — Booking Flow (5–7 days)

**Goal:** customer can book and pay; booking is recorded.

- Booking page `/book?room_type=…&check_in=…&check_out=…&guests=…`
- Server-side availability check: SQL query against `bookings` for overlapping date ranges, return whether at least one `room` of the type is free
- Price calculation server-side (never trust client); show breakdown (nightly rate × nights, taxes, total)
- Auth gate: redirect to signin with `?next=/book?...` if not signed in
- **Stripe integration**
  - Create `payment_intent` server-side
  - Stripe Payment Element on the booking confirmation step
  - Webhook `/api/webhooks/stripe` handles `payment_intent.succeeded` → flip booking to `confirmed`, assign a specific `room_id`, write loyalty transaction (deferred to Phase 5 or stub now)
  - Handle `payment_intent.payment_failed` → mark booking `cancelled`
- Confirmation email (Resend) with booking details
- `/account/bookings` — upcoming and past
- `/account/bookings/[id]` — detail + cancel button (rules: free cancel >48h before check-in, configurable)

**Critical:** wrap availability + booking insert in a Postgres transaction or a serializable function to avoid double-booking races.

**Deliverable:** real bookings can be made and paid for in Stripe test mode.

---

### Phase 4 — Admin Console (4–6 days)

**Goal:** staff can run the hotel from `/admin`.

- Route group `/admin/*` protected by middleware checking `profile.role === 'admin'` server-side
- Admin shell layout (sidebar nav, user menu)
- **Dashboard** — KPIs (occupancy %, revenue this week, arrivals today, departures today), simple chart (Recharts)
- **Rooms** — CRUD on `room_types`, `rooms`, `amenities`, image upload to Supabase Storage with reordering
- **Bookings** — list with filters (status, date, guest), detail view, manual status changes, refund button (Stripe refund API)
- **Users** — list profiles, view bookings per user, set role, adjust loyalty points (writes a `loyalty_transactions` row with `reason='adjustment'`)
- **Content** — edit `page_sections` and `testimonials` (markdown editor)
- Audit logging for admin actions (simple `admin_actions` table)

**Deliverable:** non-developer can operate the hotel via the admin UI.

---

### Phase 5 — Loyalty Program (3–4 days)

**Goal:** customers earn and redeem points.

- Define tiers: Bronze (0), Silver (500), Gold (2000), Platinum (5000) — stored in `loyalty_tiers`
- Earning: `floor(total_cents / 100) × tier_multiplier` points credited on booking `completed` (after check-out) — handled by a scheduled Supabase function or webhook on status change
- Redeeming at booking: toggle "use points" → 1 point = $0.01 discount, capped at 50% of total
- Tier recalculation: trigger or scheduled job updates `profiles.loyalty_tier_id` based on rolling 12-month points
- `/account/loyalty` — current tier, points balance, progress bar to next tier, perks list, transaction history
- Welcome bonus: 100 points on email verification
- Birthday bonus (optional): scheduled function awards points on user's birthday
- Admin: manual point adjustments already covered in Phase 4

**Deliverable:** functional loyalty loop end-to-end.

---

### Phase 6 — Polish, Hardening, Launch (3–5 days)

- Accessibility audit (axe, keyboard nav, focus traps in modals, alt text)
- Lighthouse pass: LCP < 2.5s, CLS < 0.1
- Mobile QA on real devices
- Rate limiting on auth + booking endpoints (Upstash Ratelimit or Vercel)
- Security review:
  - All write operations re-check auth + ownership server-side
  - RLS policies tested (try to read another user's booking and confirm it fails)
  - Stripe webhook signature verification
  - No service-role key in client bundles
- E2E tests with Playwright for the three critical flows: signup, book a room, admin cancel booking
- Unit tests for pricing, availability, loyalty math (Vitest)
- Privacy policy, terms of service, cookie banner if needed
- Switch Stripe to live mode
- Custom domain + SSL on Vercel

**Deliverable:** production launch.

---

## 7. Suggested Repo Layout

```
/app
  /(marketing)/page.tsx         # landing
  /(marketing)/rooms/...
  /(auth)/signin/page.tsx
  /(auth)/signup/page.tsx
  /account/...                  # protected
  /admin/...                    # protected, role=admin
  /api/webhooks/stripe/route.ts
  /api/bookings/route.ts
/components/ui                  # shadcn
/components/marketing
/components/booking
/components/admin
/lib
  /supabase/server.ts
  /supabase/client.ts
  /supabase/middleware.ts
  /stripe.ts
  /pricing.ts
  /availability.ts
  /loyalty.ts
/supabase
  /migrations/*.sql
  /seed.sql
/types/database.ts              # generated
middleware.ts
```

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Double-booking race condition | Transactional availability check + insert; unique exclusion constraint on `(room_id, daterange)` using `btree_gist` |
| Payment captured but booking not recorded | Webhook is the source of truth, not the client; idempotency keys; reconciliation job |
| Admin actions abused | Audit log table; service-role only on server; RLS treats admin as a separate policy path |
| Stripe webhook spoofing | Verify `Stripe-Signature` header on every webhook |
| RLS misconfiguration leaking data | Automated tests that sign in as user A and try to read user B's data |
| Loyalty point inflation/exploits | Points only credited on `completed` bookings (post-stay); redemptions capped per booking |
| Image storage costs | Compress on upload; use `next/image` with appropriate sizes; CDN cache headers |

---

## 9. Sequencing Notes for AI-Assisted (Vibe) Coding

- **Build the database first.** Get the schema and RLS right before writing UI; rework here is cheap, rework after UI is expensive.
- **Vertical slices, not horizontal layers.** Don't build all backend then all frontend — finish one feature top to bottom (e.g., "view a room") before starting the next.
- **Generate types from Supabase early and re-run on every schema change.** Keeps client and server in sync.
- **Write the Zod schema once and import it on both client and server.** Single source of truth for validation.
- **Test the booking flow with Stripe test cards before moving to admin.** It's the riskiest path; surface issues early.
- **Don't skip Phase 6.** The gap between "works on my machine" and "works for paying customers" is where projects die.

---

## 10. Phase-by-Phase Acceptance Checklist (Quick Reference)

- [ ] **P0:** App deployed, Supabase wired, types generated
- [ ] **P1:** Landing page live, rooms browseable, SEO meta in place
- [ ] **P2:** Signup → verify → signin → edit profile works end-to-end
- [ ] **P3:** A test card books a real room; webhook confirms it; email arrives
- [ ] **P4:** Admin can create a room, see today's arrivals, refund a booking
- [ ] **P5:** Booking completion awards points; redemption applies discount
- [ ] **P6:** Lighthouse > 90 across the board, Playwright E2E green, Stripe live
