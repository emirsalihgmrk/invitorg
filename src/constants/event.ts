export const EVENT_STATUSES = ["draft", "published", "cancelled", "completed"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

// Cancelled and completed events are final.
export function isEventEditable(status: EventStatus): boolean {
  return status === "draft" || status === "published";
}

// A published event may already have orders, so it is cancelled instead.
export function isEventDeletable(status: EventStatus): boolean {
  return status === "draft";
}

// Once published, guests may already hold or own seats of a ticket type, so
// its price and quota must not change underneath them.
export function areTicketTypesEditable(status: EventStatus): boolean {
  return status === "draft";
}
