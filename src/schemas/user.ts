import type { z } from "zod";

import { userRowSchema } from "@/db/rows";

// ── Query types ──

// Parsed at runtime: the session user comes from better-auth, not the DAL.
export const userSchema = userRowSchema.pick({
  id: true,
  name: true,
  email: true,
  role: true,
});
export type User = z.infer<typeof userSchema>;
