import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { eventsTable, ticketTypesTable } from "@/db/schema";
import type { EventDetail, EventListItem } from "@/schemas/event";

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
    where: eq(eventsTable.id, eventId),
  });
}
