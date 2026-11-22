import "server-only";

import { and, eq } from "drizzle-orm";
import { forbidden, notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

import { db } from "@/db";
import { events, eventStaff } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

export async function requireEventHost(eventId: string) {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) notFound();
  if (event.hostId !== user.id) forbidden();
  return { user, event };
}

// Host her zaman kendi etkinliğinde check-in yapabilir; görevli yalnızca atandığı etkinlikte.
export async function requireEventStaff(eventId: string) {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) notFound();
  if (event.hostId === user.id) return { user, event };

  const assignment = await db.query.eventStaff.findFirst({
    where: and(eq(eventStaff.eventId, eventId), eq(eventStaff.userId, user.id)),
  });
  if (!assignment) forbidden();
  return { user, event };
}
