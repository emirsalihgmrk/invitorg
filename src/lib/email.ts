import "server-only";

import { Resend } from "resend";

import { env } from "@/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type Email = { to: string; subject: string; text: string; html?: string };

export async function sendEmail({ to, subject, text, html }: Email) {
  if (!resend) {
    console.info(`\n[e-posta] Kime: ${to}\nKonu: ${subject}\n${text}\n`);
    return;
  }

  const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, text, html });
  if (error) throw new Error(`E-posta gönderilemedi: ${error.message}`);
}
