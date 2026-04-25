import "server-only";

import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Lazily-initialized Stripe client. Throws if STRIPE_SECRET_KEY is missing,
 * but only on first call — module load doesn't crash without the env var,
 * which keeps Phase 0 deploys working before Stripe is wired up.
 *
 * Never import from a Client Component or anything that ships to the browser.
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is required to call getStripe()");
  }

  _stripe = new Stripe(key);
  return _stripe;
}
