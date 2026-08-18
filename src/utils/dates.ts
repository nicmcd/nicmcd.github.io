/**
 * Date formatting helpers matching the legacy site's display formats.
 */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** "Jan 2, 2006" — site-wide date format. */
export function formatDate(date: Date): string {
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

/** "Jan 2006" — experience date range format. */
export function formatMonthYear(date: Date): string {
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "January 2006" — publication date format. */
export function formatPublicationDate(date: Date): string {
  return `${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "Feb 2021 – Present" / "Jan 2019 – Jan 2021" — experience range. */
export function formatDateRange(start: Date, end?: Date): string {
  const startStr = formatMonthYear(start);
  const endStr = end === undefined ? "Present" : formatMonthYear(end);
  return `${startStr} –\n${endStr}`;
}

/** ISO 8601 date (YYYY-MM-DD) for machine-readable metadata. */
export function formatIsoDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
