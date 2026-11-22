import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url({ protocol: /^https?$/ }),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  // Geliştirmede boş bırakılabilir: e-postalar konsola yazılır.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(1),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Geçersiz ortam değişkenleri:", z.treeifyError(parsed.error));
  throw new Error("Geçersiz ortam değişkenleri, .env dosyasını kontrol edin.");
}

export const env = parsed.data;
