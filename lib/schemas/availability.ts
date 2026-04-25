import { z } from "zod";

// Shared between client (search bar) and server (rooms page param parsing,
// future Phase 3 booking validation). Single source of truth per CLAUDE.md.

const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const optionalDate = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  isoDateString.optional(),
);

const optionalGuests = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.coerce.number().int().min(1).max(8).optional(),
);

export const availabilitySearchSchema = z
  .object({
    check_in: optionalDate,
    check_out: optionalDate,
    guests: optionalGuests,
  })
  .refine(
    (data) =>
      !data.check_in || !data.check_out || new Date(data.check_out) > new Date(data.check_in),
    { message: "Check-out must be after check-in", path: ["check_out"] },
  );

export type AvailabilitySearch = z.infer<typeof availabilitySearchSchema>;

/**
 * Format a Date to the YYYY-MM-DD string the schema expects.
 * Always uses local-time components — the date the user picked, not UTC.
 */
export function formatDateValue(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
