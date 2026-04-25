# Decisions Log

Append-only record of non-obvious choices made while building this project. Each entry should answer "why did we do it this way?" so future-you (or a future Claude Code session) doesn't re-litigate the same questions.

## Format

```
## YYYY-MM-DD — Short title
**Context:** what we were trying to do
**Decision:** what we chose
**Reasoning:** why this over the alternatives
**Alternatives considered:** what we rejected and why
```

---

## 2026-04-25 — Next.js 16, not 14
**Context:** `docs/plan.md` calls for Next.js 14+. `create-next-app@latest` produced 16.2.4.
**Decision:** Stay on 16.
**Reasoning:** The plan's "+" allows it. None of Phase 0's deliverables depend on v14-specific behavior.
**Alternatives considered:** Pin to `next@^14`. Rejected because we'd diverge from the latest scaffolds, miss React 19 / Tailwind 4 ergonomics, and Next 16 already shipped — pinning back is a deliberate downgrade we have no reason to take.
**Watch out for:** Training data for v14 doesn't always apply (App Router renames, async params, file-convention changes — see `proxy.ts` entry below). The bundled `AGENTS.md` warns about this; defer to `node_modules/next/dist/docs/` when the framework surface is in question.

---

## 2026-04-25 — `proxy.ts` instead of `middleware.ts`
**Context:** Next 16 deprecated the `middleware.ts` file convention in favor of `proxy.ts` (export `proxy()` instead of `middleware()`, otherwise identical signature). The dev server warns if both exist.
**Decision:** Use `proxy.ts` from day one. Migrate the Supabase session-refresh helper too: `lib/supabase/middleware.ts` → `lib/supabase/proxy.ts`.
**Reasoning:** Forward-compatible, silences the deprecation warning, internal-naming consistency.
**Alternatives considered:** Keep `lib/supabase/middleware.ts` to match the Supabase official examples. Rejected because it splits naming between root file (`proxy.ts`) and helper (`middleware.ts`) for no real benefit.

---

## 2026-04-25 — Tailwind 4 (no `tailwind.config.ts`)
**Context:** Next 16's scaffold ships Tailwind 4. No JS/TS config file; theme tokens live in `app/globals.css` under `@theme {}`.
**Decision:** Accept the default.
**Reasoning:** No reason to fight the scaffold. shadcn's CLI auto-detects v4.
**Watch out for:** Most "Tailwind config" advice online (extending `theme.colors` in JS, etc.) is for v3 and doesn't apply.

---

## 2026-04-25 — shadcn on Radix UI, not Base UI
**Context:** `shadcn init --defaults` chose the `base-nova` preset, which uses `@base-ui/react` (MUI team's headless lib).
**Decision:** Switch to Radix (`-b radix --preset nova`) before adding more components.
**Reasoning:** The broader shadcn ecosystem (community blocks, copy-paste examples, registry components) is Radix-first.
**Alternatives considered:** Stay on Base UI. Rejected because every future copy-paste from `ui.shadcn.com` or community sources would need translating between Radix's `data-state="open"` and Base UI's `data-popup-open` attribute conventions.

---

## 2026-04-25 — Supabase new API key format (`sb_publishable_*`, `sb_secret_*`)
**Context:** Supabase shipped a new key format; legacy `eyJ...` JWT keys still work but are hidden by default in new projects.
**Decision:** Use the new format. Env vars: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
**Reasoning:** Self-documenting (matches `sb_publishable_` / `sb_secret_` prefixes), forward-looking, rotatable without dashboard juggling.
**Alternatives considered:** Use the legacy names (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) for tutorial copy-paste. Rejected — the new format is where Supabase is going.
**Watch out for:** Most online tutorials still show the old names; translate when copying.

---

## 2026-04-25 — Cloud-only Supabase, no local Docker
**Context:** `supabase start` runs the full Supabase stack locally via Docker.
**Decision:** Skip it. Migrations apply directly to the linked cloud project.
**Reasoning:** No Docker dependency on the dev machine; simpler day-1 setup.
**Alternatives considered:** Local stack with `supabase start`. Rejected for now; reconsider if Phase 1 schema churn makes cloud-only iteration painful (or if we add a CI step that needs a hermetic DB).

---

## 2026-04-25 — Node 22 engine, pnpm 10
**Context:** Local machine runs Node 24, but Vercel's default runtime is Node 22.
**Decision:** `engines.node: ">=22.0.0"` in `package.json`, `.nvmrc` set to `22`. `packageManager: pnpm@10.33.2`.
**Reasoning:** Floor at 22 for Vercel parity; `>=` lets local dev keep using newer Node. `packageManager` makes the manager + version part of the lockfile-bound contract so contributors don't accidentally use npm or yarn.

---

## 2026-04-25 — Pre-commit only — no commitlint
**Context:** Husky 9 + lint-staged setup.
**Decision:** Run ESLint + Prettier on staged files in `pre-commit`. No `commit-msg` hook, no commit-message format enforcement.
**Reasoning:** Minimal value at one developer; adds friction for marginal benefit. Can adopt commitlint if more contributors join.

---

## 2026-04-25 — Prettier: semicolons on, double quotes
**Context:** Initial `.prettierrc` had `semi: false`; eight scaffolded files showed up in `--check`.
**Decision:** Flip to `semi: true`. Run `prettier --write` once for a clean baseline.
**Reasoning:** Matches Next.js scaffold output and the dominant TypeScript / shadcn convention. Less friction on copy-paste from docs.

---

## 2026-04-25 — `.env.example` is tracked
**Context:** `.gitignore` defaults to `.env*` (matches both `.env.local` and `.env.example`).
**Decision:** Add `!.env.example` negation so the env-var contract is checked into the repo, but real secrets aren't.
**Reasoning:** Standard practice; lets new contributors discover what to fill in `.env.local` without reading source code.

---

## 2026-04-25 — `SUPABASE_ACCESS_TOKEN` lives in `.env.local`
**Context:** The Supabase CLI requires an access token for `link`, `gen types`, `db push`. Two options: user shell profile (machine-global) or project `.env.local` (project-scoped).
**Decision:** Put it in `.env.local`.
**Reasoning:** Project-scoped — works for any contributor cloning the repo without polluting their global env.
**Caveat:** The Supabase CLI doesn't auto-load `.env.local`. To run CLI commands from the shell, prefix with `dotenv -e .env.local --` or `export` it in the session. Revisit when we add a `gen:types` npm script.

---

## 2026-04-25 — Vercel via dashboard import, not CLI
**Context:** Two ways to deploy: `pnpm dlx vercel link` + `vercel deploy` from the CLI, or import the GitHub repo via the Vercel dashboard.
**Decision:** Dashboard import.
**Reasoning:** The Vercel CLI's auth flow is interactive (browser OAuth, no `--token` non-TTY path here) — same blocker we hit with `supabase login`. The dashboard auto-creates the GitHub app integration so every PR gets preview deploys with no extra setup. Env vars go in once via the UI rather than `vercel env add` per variable.
**Production URL:** https://hotel-booking-beta-six.vercel.app — Vercel auto-suffixed `-beta-six` because `hotel-booking.vercel.app` was taken at the team-account level. Custom domain comes in Phase 6.
**Region:** Sydney (`syd1`), matching the Supabase project. Cold-start latency for the proxy session-refresh is well under 100ms when both hops stay in-region.

---

## 2026-04-25 — `master` branch, not `main`
**Context:** `create-next-app` initialized the repo with `master`. GitHub's default for new repos is `main`.
**Decision:** Leave it as `master` for now.
**Reasoning:** Single contributor; rename has zero functional value today. Cheap to do later (`gh repo edit --default-branch main` + local rename + Vercel default-branch update).
**Revisit when:** the project gains a second contributor or before any PR-based external review.

---

## 2026-04-25 — Public GitHub repo
**Context:** Repo visibility is a one-click choice at creation; flipping later means re-checking PRs/branches.
**Decision:** Public.
**Reasoning:** No real secrets are committed (RLS-protected DB, secret keys live in Vercel env, `.env.local` gitignored). Project ref `pyzobfqkxkygmwqrysmn` is visible but useless without keys. Public lets the repo serve as a portfolio / writeup artifact.
**Watch out for:** Don't ever commit `.env.local`, the database password, or Stripe live-mode keys. The `.gitignore` covers `.env*` (with the `!.env.example` exception) which is the main guard.
