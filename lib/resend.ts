import "server-only";

import { Resend } from "resend";

let _resend: Resend | null = null;

/**
 * Lazily-initialized Resend client. Throws if RESEND_API_KEY is missing,
 * but only on first call — module load doesn't crash without the env var,
 * which keeps Phase 0 deploys working before Resend is wired up.
 *
 * Never import from a Client Component or anything that ships to the browser.
 */
export function getResend(): Resend {
  if (_resend) return _resend;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is required to call getResend()");
  }

  _resend = new Resend(key);
  return _resend;
}
