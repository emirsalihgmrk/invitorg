import "dotenv/config";

import { defineConfig } from "drizzle-kit";

// Migrations run over the direct (unpooled) connection.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("Neither DATABASE_URL_UNPOOLED nor DATABASE_URL is set.");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url },
  strict: true,
});
