import { cache } from "react";

import { areTicketTypesEditable, isEventDeletable, isEventEditable } from "@/constants/event";
import {
  createEvent,
  createTicketType,
  deleteEvent,
  deleteTicketType,
  updateEvent,
  updateTicketType,
} from "@/dal/event/mutations";
import { getEvent, getEvents } from "@/dal/event/queries";
import { AppError } from "@/lib/errors";
import { isUuid } from "@/lib/ids";
import { randomToken } from "@/lib/tokens";
import {
  createEventSchema,
  createTicketTypeSchema,
  updateEventSchema,
  updateTicketTypeSchema,
} from "@/schemas/event";
import type {
  CreateEventInput,
  CreateTicketTypeInput,
  EventDetail,
  EventListItem,
  TicketType,
  UpdateEventInput,
  UpdateTicketTypeInput,
} from "@/schemas/event";
import { getCurrentUserService } from "@/services/auth";

// 12 characters from a 32-letter alphabet (60 bits): private events are
// reachable only by their link, so the slug must not be guessable.
const SLUG_LENGTH = 12;

// ── Helpers ──

function sumQuotas(ticketTypes: TicketType[]): number {
  return ticketTypes.reduce((sum, ticketType) => sum + ticketType.quota, 0);
}

// Ticket type quotas never add up to more than the event capacity, so locking
// a ticket type row at checkout is enough to never sell past capacity.
function assertQuotaFits(event: EventDetail, quota: number, replacedTicketTypeId?: string): void {
  const others = event.ticketTypes.filter((ticketType) => ticketType.id !== replacedTicketTypeId);
  const remaining = event.capacity - sumQuotas(others);
  if (quota <= remaining) return;
  throw new AppError(
    remaining > 0
      ? `Bu bilet türüne en fazla ${remaining} kişilik kontenjan verebilirsiniz`
      : "Etkinlik kontenjanının tamamı bilet türlerine dağıtıldı",
  );
}

function assertTicketTypesEditable(event: EventDetail): void {
  if (!areTicketTypesEditable(event.status)) {
    throw new AppError("Yayınlanmış bir etkinliğin bilet türleri değiştirilemez");
  }
}

// The ticket type id comes from the client, so it must belong to this
// (host-checked) event; this also rejects malformed ids before any query.
function findTicketType(event: EventDetail, ticketTypeId: string): TicketType {
  const ticketType = event.ticketTypes.find(({ id }) => id === ticketTypeId);
  if (!ticketType) throw new AppError("Bilet türü bulunamadı");
  return ticketType;
}

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
  const allocated = sumQuotas(event.ticketTypes);
  if (data.capacity !== undefined && data.capacity < allocated) {
    throw new AppError(`Kontenjan, bilet türlerine dağıtılan ${allocated} kişiden az olamaz`);
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

export async function createTicketTypeService(
  eventId: string,
  input: CreateTicketTypeInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Giriş yapmanız gerekiyor");

  const data = createTicketTypeSchema.parse(input);

  const event = await getEventService(eventId);
  if (!event) throw new AppError("Etkinlik bulunamadı");
  assertTicketTypesEditable(event);
  assertQuotaFits(event, data.quota);

  await createTicketType(event.id, data);
}

export async function updateTicketTypeService(
  eventId: string,
  ticketTypeId: string,
  input: UpdateTicketTypeInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Giriş yapmanız gerekiyor");

  const data = updateTicketTypeSchema.parse(input);

  const event = await getEventService(eventId);
  if (!event) throw new AppError("Etkinlik bulunamadı");
  assertTicketTypesEditable(event);
  const ticketType = findTicketType(event, ticketTypeId);
  if (data.quota !== undefined) assertQuotaFits(event, data.quota, ticketType.id);

  await updateTicketType(ticketType.id, data);
}

export async function deleteTicketTypeService(
  eventId: string,
  ticketTypeId: string,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Giriş yapmanız gerekiyor");

  const event = await getEventService(eventId);
  if (!event) throw new AppError("Etkinlik bulunamadı");
  assertTicketTypesEditable(event);
  const ticketType = findTicketType(event, ticketTypeId);

  await deleteTicketType(ticketType.id);
}
