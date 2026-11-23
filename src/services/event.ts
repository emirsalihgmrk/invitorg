import { cache } from "react";

import { isEventDeletable, isEventEditable } from "@/constants/event";
import { createEvent, deleteEvent, updateEvent } from "@/dal/event/mutations";
import { getEvent, getEvents } from "@/dal/event/queries";
import { AppError } from "@/lib/errors";
import { isUuid } from "@/lib/ids";
import { randomToken } from "@/lib/tokens";
import { createEventSchema, updateEventSchema } from "@/schemas/event";
import type {
  CreateEventInput,
  EventDetail,
  EventListItem,
  UpdateEventInput,
} from "@/schemas/event";
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

export const getEventService = cache(async (eventId: string): Promise<EventDetail | null> => {
  if (!isUuid(eventId)) return null;

  const [user, event] = await Promise.all([getCurrentUserService(), getEvent(eventId)]);
  // Only the host manages an event; to anyone else it does not exist.
  if (!user || !event || event.hostId !== user.id) return null;
  return event;
});

// ── Mutations ──

// Returns the new event's id.
export async function createEventService(input: CreateEventInput): Promise<string> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Giriş yapmanız gerekiyor");

  const data = createEventSchema.parse(input);

  const { id } = await createEvent(user.id, randomToken(SLUG_LENGTH), data);
  return id;
}

export async function updateEventService(eventId: string, input: UpdateEventInput): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Giriş yapmanız gerekiyor");

  const data = updateEventSchema.parse(input);

  const event = await getEventService(eventId);
  if (!event) throw new AppError("Etkinlik bulunamadı");
  if (!isEventEditable(event.status)) {
    throw new AppError("İptal edilmiş veya tamamlanmış bir etkinlik düzenlenemez");
  }

  await updateEvent(event.id, data);
}

export async function deleteEventService(eventId: string): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Giriş yapmanız gerekiyor");

  const event = await getEventService(eventId);
  if (!event) throw new AppError("Etkinlik bulunamadı");
  if (!isEventDeletable(event.status)) {
    throw new AppError("Yalnızca taslak etkinlikler silinebilir");
  }

  await deleteEvent(event.id);
}
