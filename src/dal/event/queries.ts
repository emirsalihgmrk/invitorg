import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { eventsTable, ticketTypesTable } from "@/db/schema";
import type { EventDetail, EventListItem } from "@/schemas/event";

// getEvent and getEventBySlug read the same shape by different keys.
const EVENT_DETAIL_QUERY = {
  columns: {
    id: true,
    hostId: true,
    slug: true,
    title: true,
    description: true,
    venue: true,
    startsAt: true,
    capacity: true,
    isPrivate: true,
    status: true,
    refundPolicy: true,
  },
  with: {
    ticketTypes: {
      columns: { id: true, name: true, price: true, quota: true },
      orderBy: asc(ticketTypesTable.createdAt),
    },
  },
} as const;

export async function getEvents(hostId: string): Promise<EventListItem[]> {
  return db.query.eventsTable.findMany({
    columns: {
      id: true,
      title: true,
      venue: true,
      startsAt: true,
      capacity: true,
      isPrivate: true,
      status: true,
    },
    where: eq(eventsTable.hostId, hostId),
    orderBy: desc(eventsTable.startsAt),
  });
}

export async function getEvent(eventId: string): Promise<EventDetail | undefined> {
  return db.query.eventsTable.findFirst({
    ...EVENT_DETAIL_QUERY,
    where: eq(eventsTable.id, eventId),
  });
}

export async function getEventBySlug(slug: string): Promise<EventDetail | undefined> {
  return db.query.eventsTable.findFirst({
    ...EVENT_DETAIL_QUERY,
    where: eq(eventsTable.slug, slug),
  });
}
