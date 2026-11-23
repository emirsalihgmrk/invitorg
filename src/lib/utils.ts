export { cn } from "cn";

// Events take place in Turkey, so dates are entered and shown in Turkish time
// whatever the viewer's zone. Turkey has stayed on UTC+3 all year since 2016,
// which makes the fixed offset below exact and the conversion deterministic on
// both the server and the client.
const EVENT_UTC_OFFSET = "+03:00";
const EVENT_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

const EVENT_DATE_TIME_FORMAT = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

export function formatEventDateTime(date: Date): string {
  return EVENT_DATE_TIME_FORMAT.format(date);
}

// Date → `<input type="datetime-local">` value, e.g. "2026-12-01T19:30".
export function toDateTimeLocalValue(date: Date): string {
  return new Date(date.getTime() + EVENT_UTC_OFFSET_MS).toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string): Date {
  return new Date(`${value}:00${EVENT_UTC_OFFSET}`);
}

const PRICE_FORMAT = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

// Prices are stored in kuruş.
export function formatPrice(kurus: number): string {
  return PRICE_FORMAT.format(kurus / 100);
}
