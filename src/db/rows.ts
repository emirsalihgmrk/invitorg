import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { eventsTable, ticketTypesTable, userTable } from "@/db/schema";

export type EventRow = typeof eventsTable.$inferSelect;
export const createEventRowSchema = createInsertSchema(eventsTable);

export type TicketTypeRow = typeof ticketTypesTable.$inferSelect;
export const createTicketTypeRowSchema = createInsertSchema(ticketTypesTable);

export const userRowSchema = createSelectSchema(userTable);
