import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import type { Transaction } from "@/db";
import { orderItemsTable, ordersTable } from "@/db/schema";
import type { CreateOrderInput, CreateOrderItemInput, UpdateOrderInput } from "@/schemas/order";

export async function createOrder(
  userId: string,
  eventId: string,
  input: CreateOrderInput,
  tx?: Transaction,
): Promise<{ id: string }> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(ordersTable)
    .values({ ...input, userId, eventId })
    .returning({ id: ordersTable.id });
  return row;
}

export async function createOrderItems(
  orderId: string,
  inputs: CreateOrderItemInput[],
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor.insert(orderItemsTable).values(inputs.map((input) => ({ ...input, orderId })));
}

// Guarded: only a pending order changes; undefined means it no longer was.
export async function updateOrder(
  orderId: string,
  input: UpdateOrderInput,
  tx?: Transaction,
): Promise<{ id: string } | undefined> {
  const executor = tx ?? db;
  const [row] = await executor
    .update(ordersTable)
    .set(input)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.status, "pending")))
    .returning({ id: ordersTable.id });
  return row;
}

// Updates every pending order of a user for one event.
export async function updateOrders(
  userId: string,
  eventId: string,
  input: UpdateOrderInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .update(ordersTable)
    .set(input)
    .where(
      and(
        eq(ordersTable.userId, userId),
        eq(ordersTable.eventId, eventId),
        eq(ordersTable.status, "pending"),
      ),
    );
}
