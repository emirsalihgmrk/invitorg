import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { EVENT_STATUSES } from "@/constants/event";
import { userTable } from "@/db/schema/auth";

export const eventStatusEnum = pgEnum("event_status", EVENT_STATUSES);

export const eventsTable = pgTable(
  "events",
  {
    id: uuid().primaryKey().defaultRandom(),
    // Must be unguessable: private events are reachable only by their link.
    slug: text().notNull().unique(),
    hostId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: "restrict" }),
    title: text().notNull(),
    description: text(),
    venue: text(),
    startsAt: timestamp({ withTimezone: true }).notNull(),
    capacity: integer().notNull(),
    isPrivate: boolean().notNull().default(false),
    status: eventStatusEnum().notNull().default("draft"),
    refundPolicy: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.hostId)],
);

// Staff are assigned per event, so check-in rights never leak to other events.
export const eventStaffTable = pgTable(
  "event_staff",
  {
    eventId: uuid()
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })],
);

export const ticketTypesTable = pgTable(
  "ticket_types",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    name: text().notNull(),
    // In kuruş, so prices stay integers.
    price: integer().notNull().default(0),
    quota: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId)],
);

export const menuOptionsTable = pgTable(
  "menu_options",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    name: text().notNull(),
    dietaryTags: text().array().notNull().default([]),
  },
  (t) => [index().on(t.eventId)],
);

export const invitationsTable = pgTable(
  "invitations",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    email: text(),
    code: text().notNull().unique(),
    plusOnes: integer().notNull().default(0),
    usedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId)],
);

export const waitlistEntriesTable = pgTable(
  "waitlist_entries",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId, t.position)],
);

// ── Relations ──

export const eventsRelations = relations(eventsTable, ({ many }) => ({
  ticketTypes: many(ticketTypesTable),
}));

export const ticketTypesRelations = relations(ticketTypesTable, ({ one }) => ({
  event: one(eventsTable, { fields: [ticketTypesTable.eventId], references: [eventsTable.id] }),
}));
