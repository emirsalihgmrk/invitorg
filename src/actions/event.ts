"use server";

import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/lib/action";
import type {
  CreateEventInput,
  CreateTicketTypeInput,
  UpdateEventInput,
  UpdateTicketTypeInput,
} from "@/schemas/event";
import {
  createEventService,
  createTicketTypeService,
  deleteEventService,
  deleteTicketTypeService,
  updateEventService,
  updateTicketTypeService,
} from "@/services/event";

export async function createEventAction(input: CreateEventInput): Promise<ActionResult<string>> {
  try {
    const eventId = await createEventService(input);
    return { ok: true, data: eventId };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function updateEventAction(
  eventId: string,
  input: UpdateEventInput,
): Promise<ActionResult> {
  try {
    await updateEventService(eventId, input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  try {
    await deleteEventService(eventId);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function createTicketTypeAction(
  eventId: string,
  input: CreateTicketTypeInput,
): Promise<ActionResult> {
  try {
    await createTicketTypeService(eventId, input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function updateTicketTypeAction(
  eventId: string,
  ticketTypeId: string,
  input: UpdateTicketTypeInput,
): Promise<ActionResult> {
  try {
    await updateTicketTypeService(eventId, ticketTypeId, input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function deleteTicketTypeAction(
  eventId: string,
  ticketTypeId: string,
): Promise<ActionResult> {
  try {
    await deleteTicketTypeService(eventId, ticketTypeId);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
