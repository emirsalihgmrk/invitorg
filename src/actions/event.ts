"use server";

import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/lib/action";
import type { CreateEventInput } from "@/schemas/event";
import { createEventService } from "@/services/event";

export async function createEventAction(input: CreateEventInput): Promise<ActionResult> {
  try {
    await createEventService(input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
