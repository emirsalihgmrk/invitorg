import "server-only";

import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import { env } from "@/env";
import * as schema from "./schema";

// WebSocket sürücüsü: interaktif transaction ve SELECT ... FOR UPDATE için gerekli
// (neon-http sürücüsü bunları desteklemez).
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
