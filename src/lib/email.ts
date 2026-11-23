import "server-only";

import { Resend } from "resend";

import { env } from "@/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailInput): Promise<void> {
  // Without an API key (local development) the email is printed instead.
  if (!resend) {
    console.info(`\n[email] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }

  const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, text, html });
  if (error) throw new Error(`Email could not be sent: ${error.message}`);
}
