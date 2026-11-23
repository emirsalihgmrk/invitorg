import { cache } from "react";

import { createEvent } from "@/dal/event/mutations";
import { getEvents } from "@/dal/event/queries";
import { AppError } from "@/lib/errors";
import { randomToken } from "@/lib/tokens";
import { createEventSchema } from "@/schemas/event";
import type { CreateEventInput, EventListItem } from "@/schemas/event";
import { getCurrentUserService } from "@/services/auth";

// 12 characters from a 32-letter alphabet (60 bits): private events are
// reachable only by their link, so the slug must not be guessable.
const SLUG_LENGTH = 12;

// ── Reads ──

export const getEventsService = cache(async (): Promise<EventListItem[]> => {
  const user = await getCurrentUserService();
  if (!user) return [];
  return getEvents(user.id);
});

// ── Mutations ──

export async function createEventService(input: CreateEventInput): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Giriş yapmanız gerekiyor");

  const data = createEventSchema.parse(input);

  await createEvent(user.id, randomToken(SLUG_LENGTH), data);
}
