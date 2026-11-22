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

import { user } from "./auth";

export const eventStatus = pgEnum("event_status", ["draft", "published", "cancelled", "completed"]);

export const events = pgTable(
  "events",
  {
    id: uuid().primaryKey().defaultRandom(),
    // Tahmin edilemez olmalı (bkz. roadmap §6.5).
    slug: text().notNull().unique(),
    hostId: text()
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    title: text().notNull(),
    description: text(),
    venue: text(),
    startsAt: timestamp({ withTimezone: true }).notNull(),
    capacity: integer().notNull(),
    isPrivate: boolean().notNull().default(false),
    status: eventStatus().notNull().default("draft"),
    refundPolicy: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.hostId)],
);

// Görevli (staff) ataması etkinlik bazlıdır.
export const eventStaff = pgTable(
  "event_staff",
  {
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })],
);

export const ticketTypes = pgTable(
  "ticket_types",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text().notNull(),
    // Kuruş cinsinden.
    price: integer().notNull().default(0),
    quota: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId)],
);

export const menuOptions = pgTable(
  "menu_options",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text().notNull(),
    dietaryTags: text().array().notNull().default([]),
  },
  (t) => [index().on(t.eventId)],
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    email: text(),
    code: text().notNull().unique(),
    plusOnes: integer().notNull().default(0),
    usedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId)],
);

export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: uuid().primaryKey().defaultRandom(),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.eventId, t.position)],
);
