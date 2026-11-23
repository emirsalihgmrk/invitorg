import { z } from "zod";

import { createEventRowSchema } from "@/db/rows";
import type { EventRow } from "@/db/rows";

// ── Query types ──

export type EventListItem = Pick<
  EventRow,
  "id" | "title" | "venue" | "startsAt" | "capacity" | "isPrivate" | "status"
>;

export type EventDetail = Pick<
  EventRow,
  | "id"
  | "hostId"
  | "slug"
  | "title"
  | "description"
  | "venue"
  | "startsAt"
  | "capacity"
  | "isPrivate"
  | "status"
  | "refundPolicy"
>;

// ── DAL input schemas ──

// Blank optional text is stored as NULL rather than an empty string.
function optionalText(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null)
    .nullish();
}

// Also the input of createEventService: the host sends every field it stores.
export const createEventSchema = createEventRowSchema
  .pick({
    title: true,
    description: true,
    venue: true,
    startsAt: true,
    capacity: true,
    isPrivate: true,
    refundPolicy: true,
  })
  .extend({
    title: z
      .string()
      .trim()
      .min(1, "Etkinliğe bir başlık verin")
      .max(120, "Başlık en fazla 120 karakter olabilir"),
    description: optionalText(5000, "Açıklama en fazla 5000 karakter olabilir"),
    venue: optionalText(200, "Mekân en fazla 200 karakter olabilir"),
    startsAt: z
      .date({ error: "Geçerli bir tarih girin" })
      .refine((date) => date > new Date(), "Etkinlik tarihi gelecekte olmalı"),
    capacity: z
      .number({ error: "Kontenjanı girin" })
      .int("Kontenjan tam sayı olmalı")
      .min(1, "Kontenjan en az 1 olmalı")
      .max(10_000, "Kontenjan en fazla 10.000 olabilir"),
    isPrivate: z.boolean(),
    refundPolicy: optionalText(2000, "İade politikası en fazla 2000 karakter olabilir"),
  });
export type CreateEventInput = z.infer<typeof createEventSchema>;

// Also the input of updateEventService.
export const updateEventSchema = createEventSchema.partial();
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
