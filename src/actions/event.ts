"use server";

import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/lib/action";
import type {
  CreateEventInput,
  CreateTicketTypeInput,
  EditEventInput,
  UpdateTicketTypeInput,
} from "@/schemas/event";
import {
  cancelEventService,
  createEventService,
  createTicketTypeService,
  deleteEventService,
  deleteTicketTypeService,
  editEventService,
  publishEventService,
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

export async function editEventAction(
  eventId: string,
  input: EditEventInput,
): Promise<ActionResult> {
  try {
    await editEventService(eventId, input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function publishEventAction(eventId: string): Promise<ActionResult> {
  try {
    await publishEventService(eventId);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function cancelEventAction(eventId: string): Promise<ActionResult> {
  try {
    await cancelEventService(eventId);
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
