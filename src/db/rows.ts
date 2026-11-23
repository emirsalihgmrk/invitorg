import { createSelectSchema } from "drizzle-zod";

import { userTable } from "@/db/schema";

export const userRowSchema = createSelectSchema(userTable);
