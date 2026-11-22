import "dotenv/config";

import { defineConfig } from "drizzle-kit";

// Migration'lar pooler'sız (doğrudan) bağlantıyla çalıştırılır.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_UNPOOLED veya DATABASE_URL tanımlı değil.");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url },
  strict: true,
});
