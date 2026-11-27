import { z } from "zod";

import { MAX_SEATS_PER_ORDER } from "@/constants/order";
import { createOrderItemRowSchema, createOrderRowSchema } from "@/db/rows";
import type { EventRow, OrderItemRow, OrderRow, TicketTypeRow } from "@/db/rows";

// ── Query types ──

export type OrderDetail = Pick<OrderRow, "id" | "userId" | "status" | "total" | "expiresAt"> & {
  event: Pick<EventRow, "id" | "slug" | "title" | "venue" | "startsAt">;
  items: OrderItem[];
};

export type OrderItem = Pick<OrderItemRow, "id" | "quantity" | "unitPrice"> & {
  ticketType: Pick<TicketTypeRow, "name">;
};

// An item of an order that takes seats: paid, or pending and not yet expired.
export type HeldOrderItem = Pick<OrderItemRow, "ticketTypeId" | "quantity">;

// ── DAL input schemas ──

// Both fields are derived by the server, so this is never client input.
export const createOrderSchema = createOrderRowSchema.pick({ total: true, expiresAt: true });
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// The ticket type varies per item of one bulk insert, so unlike other relation
// ids it is part of the input; the order id is a separate parameter.
export const createOrderItemSchema = createOrderItemRowSchema
  .pick({ ticketTypeId: true, quantity: true, unitPrice: true })
  .extend({
    ticketTypeId: z.uuid("Bilet türü bulunamadı"),
    quantity: z
      .number({ error: "Bilet adedini seçin" })
      .int("Bilet adedi tam sayı olmalı")
      .min(1, "Bilet adedi en az 1 olmalı")
      .max(MAX_SEATS_PER_ORDER, `Bir siparişte en fazla ${MAX_SEATS_PER_ORDER} bilet alınabilir`),
    unitPrice: z.number().int().min(0),
  });
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;

export const updateOrderSchema = createOrderRowSchema.pick({ status: true }).partial();
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

// ── Service input schemas ──

// Prices and the total come from the server, never from the client.
export const placeOrderSchema = z.object({
  items: z
    .array(createOrderItemSchema.pick({ ticketTypeId: true, quantity: true }))
    .min(1, "En az bir bilet seçin")
    .refine(
      (items) => new Set(items.map(({ ticketTypeId }) => ticketTypeId)).size === items.length,
      "Her bilet türü yalnızca bir kez seçilebilir",
    )
    .refine(
      (items) => items.reduce((sum, { quantity }) => sum + quantity, 0) <= MAX_SEATS_PER_ORDER,
      `Bir siparişte en fazla ${MAX_SEATS_PER_ORDER} bilet alınabilir`,
    ),
});
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

// ── Service result types ──

export interface TicketTypeAvailability {
  ticketTypeId: string;
  remaining: number;
}
