import { and, asc, eq, gt, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import type { Transaction } from "@/db";
import { orderItemsTable, ordersTable, ticketTypesTable } from "@/db/schema";
import type { TicketType } from "@/schemas/event";
import type { HeldOrderItem, OrderDetail } from "@/schemas/order";

export async function getOrder(orderId: string): Promise<OrderDetail | undefined> {
  return db.query.ordersTable.findFirst({
    columns: { id: true, userId: true, status: true, total: true, expiresAt: true },
    where: eq(ordersTable.id, orderId),
    with: {
      event: { columns: { id: true, slug: true, title: true, venue: true, startsAt: true } },
      items: {
        columns: { id: true, quantity: true, unitPrice: true },
        with: { ticketType: { columns: { name: true } } },
      },
    },
  });
}

// Rows are locked in id order, so two checkouts over the same ticket types
// always wait for each other instead of deadlocking.
export async function lockTicketTypes(
  ticketTypeIds: string[],
  tx: Transaction,
): Promise<TicketType[]> {
  return tx
    .select({
      id: ticketTypesTable.id,
      name: ticketTypesTable.name,
      price: ticketTypesTable.price,
      quota: ticketTypesTable.quota,
    })
    .from(ticketTypesTable)
    .where(inArray(ticketTypesTable.id, ticketTypeIds))
    .orderBy(asc(ticketTypesTable.id))
    .for("update");
}

// Filters on the order's status, which the relational API cannot do from the
// item side, hence the join. Pending orders past `expiresAt` hold no seats.
export async function getOrderItems(
  ticketTypeIds: string[],
  now: Date,
  tx?: Transaction,
): Promise<HeldOrderItem[]> {
  const executor = tx ?? db;
  return executor
    .select({ ticketTypeId: orderItemsTable.ticketTypeId, quantity: orderItemsTable.quantity })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
    .where(
      and(
        inArray(orderItemsTable.ticketTypeId, ticketTypeIds),
        or(
          eq(ordersTable.status, "paid"),
          and(eq(ordersTable.status, "pending"), gt(ordersTable.expiresAt, now)),
        ),
      ),
    );
}
