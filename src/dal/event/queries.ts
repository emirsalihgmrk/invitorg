import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { eventsTable } from "@/db/schema";
import type { EventListItem } from "@/schemas/event";

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
