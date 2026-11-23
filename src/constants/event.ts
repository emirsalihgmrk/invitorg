export const EVENT_STATUSES = ["draft", "published", "cancelled", "completed"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

// The only status changes an event can make. A published event never goes back
// to draft (guests may already hold seats); cancelled and completed are final.
const EVENT_STATUS_TRANSITIONS: Record<EventStatus, readonly EventStatus[]> = {
  draft: ["published"],
  published: ["cancelled", "completed"],
  cancelled: [],
  completed: [],
};

export function canChangeEventStatus(from: EventStatus, to: EventStatus): boolean {
  return EVENT_STATUS_TRANSITIONS[from].includes(to);
}

// A final event (no way out of its status) no longer changes at all.
export function isEventEditable(status: EventStatus): boolean {
  return EVENT_STATUS_TRANSITIONS[status].length > 0;
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
