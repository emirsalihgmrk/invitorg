"use server";

import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/lib/action";
import type { CreateEventInput, UpdateEventInput } from "@/schemas/event";
import { createEventService, deleteEventService, updateEventService } from "@/services/event";

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
