import { z } from "zod";

import { createEventRowSchema, createTicketTypeRowSchema } from "@/db/rows";
import type { EventRow, TicketTypeRow } from "@/db/rows";

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
> & { ticketTypes: TicketType[] };

export type TicketType = Pick<TicketTypeRow, "id" | "name" | "price" | "quota">;

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

// Unlike the host's edits, a DAL update may also change the status (publish,
// cancel), which only the server sets.
export const updateEventSchema = createEventSchema
  .extend(createEventRowSchema.pick({ status: true }).shape)
  .partial();
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// Also the input of createTicketTypeService.
export const createTicketTypeSchema = createTicketTypeRowSchema
  .pick({ name: true, price: true, quota: true })
  .extend({
    name: z
      .string()
      .trim()
      .min(1, "Bilet türüne bir ad verin")
      .max(60, "Ad en fazla 60 karakter olabilir"),
    // In kuruş; 0 is a free ticket.
    price: z
      .number({ error: "Fiyatı girin" })
      .int("Geçerli bir fiyat girin")
      .min(0, "Fiyat negatif olamaz")
      .max(10_000_000, "Fiyat en fazla 100.000 TL olabilir"),
    quota: z
      .number({ error: "Kontenjanı girin" })
      .int("Kontenjan tam sayı olmalı")
      .min(1, "Kontenjan en az 1 olmalı"),
  });
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;

// Also the input of updateTicketTypeService.
export const updateTicketTypeSchema = createTicketTypeSchema.partial();
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;

// ── Service input schemas ──

export const editEventSchema = updateEventSchema.omit({ status: true });
export type EditEventInput = z.infer<typeof editEventSchema>;
