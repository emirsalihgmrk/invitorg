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

import { user } from "./auth";
import { events, menuOptions, ticketTypes } from "./events";

export const orderStatus = pgEnum("order_status", [
  "pending", // geçici rezervasyon (hold), expiresAt'e kadar geçerli
  "paid",
  "expired",
  "cancelled",
  "refunded",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

export const ticketStatus = pgEnum("ticket_status", ["active", "cancelled", "refunded"]);

export const checkInResult = pgEnum("check_in_result", ["valid", "already_used", "invalid"]);

export const orders = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    status: orderStatus().notNull().default("pending"),
    // Kuruş cinsinden.
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

export const payments = pgTable(
  "payments",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    provider: text().notNull(),
    providerRef: text().notNull(),
    status: paymentStatus().notNull().default("pending"),
    rawPayload: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  // Webhook idempotency: aynı sağlayıcı referansı iki kez işlenemez.
  (t) => [unique().on(t.provider, t.providerRef), index().on(t.orderId)],
);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    ticketTypeId: uuid()
      .notNull()
      .references(() => ticketTypes.id, { onDelete: "restrict" }),
    holderName: text().notNull(),
    menuOptionId: uuid().references(() => menuOptions.id, { onDelete: "set null" }),
    // QR içinde yalnızca bu rastgele token bulunur (bkz. roadmap §6.1).
    qrToken: text().notNull().unique(),
    status: ticketStatus().notNull().default("active"),
    checkedInAt: timestamp({ withTimezone: true }),
    checkedInBy: text().references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId), index().on(t.orderId)],
);

export const checkInLogs = pgTable(
  "check_in_logs",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    // Geçersiz taramalarda bilet bulunmayabilir.
    ticketId: uuid().references(() => tickets.id, { onDelete: "set null" }),
    staffId: text()
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    result: checkInResult().notNull(),
    scannedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId, t.scannedAt)],
);
