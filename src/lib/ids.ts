import { z } from "zod";

const uuidSchema = z.uuid();

// Ids from the URL or a client are untrusted. Checked before a query, a
// malformed one becomes a plain "not found" instead of a failed uuid cast in
// Postgres. User ids are better-auth text ids, not uuids, and are never checked.
export function isUuid(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}
