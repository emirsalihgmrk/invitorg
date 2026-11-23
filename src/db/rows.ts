import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { eventsTable, userTable } from "@/db/schema";

export type EventRow = typeof eventsTable.$inferSelect;
export const createEventRowSchema = createInsertSchema(eventsTable);

export const userRowSchema = createSelectSchema(userTable);
