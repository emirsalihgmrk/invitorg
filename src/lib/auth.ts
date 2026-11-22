import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user", input: false },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  rateLimit: { enabled: true },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60,
      allowedAttempts: 5,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;
        await sendEmail({
          to: email,
          subject: `Giriş kodunuz: ${otp}`,
          text: `Invitorg giriş kodunuz: ${otp}\n\nKod 10 dakika geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.`,
        });
      },
    }),
    // Server action'larda set edilen çerezler için; listede son sırada olmalı.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
