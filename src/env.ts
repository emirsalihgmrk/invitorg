import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url({ protocol: /^https?$/ }),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  // Optional in development: emails are printed to the console instead.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(1),
  IYZICO_API_KEY: z.string().min(1),
  IYZICO_SECRET_KEY: z.string().min(1),
  // Payment runs in the sandbox only, so the live API cannot be reached by mistake.
  IYZICO_BASE_URL: z.literal("https://sandbox-api.iyzipay.com"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables, check your .env file.");
}

export const env = parsed.data;
