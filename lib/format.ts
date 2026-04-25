/**
 * Format a price stored in integer cents as USD with no fractional digits.
 * For Phase 1's marketing displays. Phase 3 booking math uses lib/pricing.ts.
 */
export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
