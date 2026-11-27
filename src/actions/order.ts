"use server";

import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/lib/action";
import type { PlaceOrderInput } from "@/schemas/order";
import { cancelOrderService, placeOrderService } from "@/services/order";

export async function placeOrderAction(
  eventSlug: string,
  input: PlaceOrderInput,
): Promise<ActionResult<string>> {
  try {
    const orderId = await placeOrderService(eventSlug, input);
    return { ok: true, data: orderId };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function cancelOrderAction(orderId: string): Promise<ActionResult> {
  try {
    await cancelOrderService(orderId);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
