import { connection } from "next/server";
import { cache } from "react";

import { isEventOnSale } from "@/constants/event";
import { ORDER_HOLD_MINUTES } from "@/constants/order";
import { createOrder, createOrderItems, updateOrder, updateOrders } from "@/dal/order/mutations";
import { getOrder, getOrderItems, lockTicketTypes } from "@/dal/order/queries";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { isUuid } from "@/lib/ids";
import type { EventDetail } from "@/schemas/event";
import { placeOrderSchema } from "@/schemas/order";
import type {
  CreateOrderItemInput,
  HeldOrderItem,
  OrderDetail,
  PlaceOrderInput,
  TicketTypeAvailability,
} from "@/schemas/order";
import { getCurrentUserService } from "@/services/auth";
import { getEventBySlugService } from "@/services/event";

// ── Helpers ──

function isOnSale(event: EventDetail, now: Date): boolean {
  return isEventOnSale(event.status) && event.startsAt > now;
}

// Seats taken per ticket type id.
function countHeldSeats(items: HeldOrderItem[]): Map<string, number> {
  const held = new Map<string, number>();
  for (const { ticketTypeId, quantity } of items) {
    held.set(ticketTypeId, (held.get(ticketTypeId) ?? 0) + quantity);
  }
  return held;
}

// ── Reads ──

export const getOrderService = cache(async (orderId: string): Promise<OrderDetail | null> => {
  if (!isUuid(orderId)) return null;

  await connection(); // see getEventService
  const [user, order] = await Promise.all([getCurrentUserService(), getOrder(orderId)]);
  // An order is personal; to anyone else it does not exist.
  if (!user || !order || order.userId !== user.id) return null;
  // A hold past its time is over even before the cleanup job writes `expired`,
  // just as getOrderItems no longer counts its seats.
  if (order.status === "pending" && order.expiresAt <= new Date()) {
    return { ...order, status: "expired" };
  }
  return order;
});

// A snapshot for the ticket picker; placeOrderService checks again under lock.
// null when the event does not sell tickets (a draft, over, or cancelled).
export const getTicketAvailabilityService = cache(
  async (eventSlug: string): Promise<TicketTypeAvailability[] | null> => {
    const event = await getEventBySlugService(eventSlug);
    const now = new Date();
    if (!event || !isOnSale(event, now)) return null;

    const held = countHeldSeats(
      await getOrderItems(
        event.ticketTypes.map(({ id }) => id),
        now,
      ),
    );
    return event.ticketTypes.map(({ id, quota }) => ({
      ticketTypeId: id,
      remaining: Math.max(0, quota - (held.get(id) ?? 0)),
    }));
  },
);

// ── Mutations ──

// Holds the seats as a pending order until it is paid or expires. Returns the
// new order's id.
export async function placeOrderService(
  eventSlug: string,
  input: PlaceOrderInput,
): Promise<string> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Bilet almak için giriş yapın");

  const data = placeOrderSchema.parse(input);

  const event = await getEventBySlugService(eventSlug);
  if (!event) throw new AppError("Etkinlik bulunamadı");
  if (!isOnSale(event, new Date())) {
    throw new AppError("Bu etkinlik için bilet satışı kapalı");
  }
  // Ticket type ids come from the client, so they must belong to this event.
  const ticketTypeIds = data.items.map(({ ticketTypeId }) => ticketTypeId);
  if (!ticketTypeIds.every((id) => event.ticketTypes.some((ticketType) => ticketType.id === id))) {
    throw new AppError("Bilet türü bulunamadı");
  }

  return db.transaction(async (tx) => {
    // Quotas never add up to more than the event capacity, so locking the
    // ticket types is enough to never sell past capacity either.
    const ticketTypes = await lockTicketTypes(ticketTypeIds, tx);

    // One hold per guest and event: a new checkout replaces the previous one,
    // whose seats are counted as free below. A failed checkout rolls this back.
    await updateOrders(user.id, event.id, { status: "cancelled" }, tx);

    const now = new Date();
    const held = countHeldSeats(await getOrderItems(ticketTypeIds, now, tx));

    const items = data.items.map(({ ticketTypeId, quantity }): CreateOrderItemInput => {
      const ticketType = ticketTypes.find(({ id }) => id === ticketTypeId);
      if (!ticketType) throw new AppError("Bilet türü bulunamadı");
      const remaining = ticketType.quota - (held.get(ticketType.id) ?? 0);
      if (quantity > remaining) {
        throw new AppError(
          remaining > 0
            ? `"${ticketType.name}" için yalnızca ${remaining} yer kaldı`
            : `"${ticketType.name}" tükendi`,
        );
      }
      return { ticketTypeId, quantity, unitPrice: ticketType.price };
    });

    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const expiresAt = new Date(now.getTime() + ORDER_HOLD_MINUTES * 60_000);
    const { id } = await createOrder(user.id, event.id, { total, expiresAt }, tx);
    await createOrderItems(id, items, tx);
    return id;
  });
}

export async function cancelOrderService(orderId: string): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Giriş yapmanız gerekiyor");

  const order = await getOrderService(orderId);
  if (!order) throw new AppError("Sipariş bulunamadı");
  if (order.status !== "pending") throw new AppError("Bu sipariş artık iptal edilemez");

  const cancelled = await updateOrder(order.id, { status: "cancelled" });
  if (!cancelled) throw new AppError("Bu sipariş artık iptal edilemez");
}
