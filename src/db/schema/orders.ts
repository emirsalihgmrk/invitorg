import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/constants/order";
import { CHECK_IN_RESULTS, TICKET_STATUSES } from "@/constants/ticket";
import { userTable } from "@/db/schema/auth";
import { eventsTable, menuOptionsTable, ticketTypesTable } from "@/db/schema/events";

export const orderStatusEnum = pgEnum("order_status", ORDER_STATUSES);
export const paymentStatusEnum = pgEnum("payment_status", PAYMENT_STATUSES);
export const ticketStatusEnum = pgEnum("ticket_status", TICKET_STATUSES);
export const checkInResultEnum = pgEnum("check_in_result", CHECK_IN_RESULTS);

export const ordersTable = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: "restrict" }),
    eventId: uuid()
      .notNull()
      .references(() => eventsTable.id, { onDelete: "restrict" }),
    status: orderStatusEnum().notNull().default("pending"),
    // In kuruş, so totals stay integers.
    total: integer().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.eventId, t.status), index().on(t.userId)],
);

export const paymentsTable = pgTable(
  "payments",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => ordersTable.id, { onDelete: "restrict" }),
    provider: text().notNull(),
    providerRef: text().notNull(),
    status: paymentStatusEnum().notNull().default("pending"),
    rawPayload: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  // Webhook idempotency: the same provider reference can be recorded only once.
  (t) => [unique().on(t.provider, t.providerRef), index().on(t.orderId)],
);

export const ticketsTable = pgTable(
  "tickets",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => ordersTable.id, { onDelete: "restrict" }),
    eventId: uuid()
      .notNull()
      .references(() => eventsTable.id, { onDelete: "restrict" }),
    ticketTypeId: uuid()
      .notNull()
      .references(() => ticketTypesTable.id, { onDelete: "restrict" }),
    holderName: text().notNull(),
    menuOptionId: uuid().references(() => menuOptionsTable.id, { onDelete: "set null" }),
    // The QR code carries only this random token, never personal data.
    qrToken: text().notNull().unique(),
    status: ticketStatusEnum().notNull().default("active"),
    checkedInAt: timestamp({ withTimezone: true }),
    checkedInBy: text().references(() => userTable.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId), index().on(t.orderId)],
);

export const checkInLogsTable = pgTable(
  "check_in_logs",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    // An invalid scan may match no ticket.
    ticketId: uuid().references(() => ticketsTable.id, { onDelete: "set null" }),
    staffId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: "restrict" }),
    result: checkInResultEnum().notNull(),
    scannedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId, t.scannedAt)],
);
