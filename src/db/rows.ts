import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import {
  eventsTable,
  orderItemsTable,
  ordersTable,
  ticketTypesTable,
  userTable,
} from "@/db/schema";

export type EventRow = typeof eventsTable.$inferSelect;
export const createEventRowSchema = createInsertSchema(eventsTable);

export type TicketTypeRow = typeof ticketTypesTable.$inferSelect;
export const createTicketTypeRowSchema = createInsertSchema(ticketTypesTable);

export type OrderRow = typeof ordersTable.$inferSelect;
export const createOrderRowSchema = createInsertSchema(ordersTable);

export type OrderItemRow = typeof orderItemsTable.$inferSelect;
export const createOrderItemRowSchema = createInsertSchema(orderItemsTable);

export const userRowSchema = createSelectSchema(userTable);
