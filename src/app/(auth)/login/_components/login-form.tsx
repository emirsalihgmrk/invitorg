"use client";

import { use, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const OTP_LENGTH = 6;
const EMAIL_STEP_DESCRIPTION = "E-posta adresinize 6 haneli bir giriş kodu göndereceğiz.";

// Only same-site paths are accepted, so `next` can't become an open redirect.
function getSafeNextPath(value: string | string[] | undefined): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

interface LoginFormProps {
  searchParams: PageProps<"/login">["searchParams"];
}

export default function LoginForm({ searchParams }: LoginFormProps) {
  const nextPath = getSafeNextPath(use(searchParams).next);

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function sendCode() {
    setIsPending(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    setIsPending(false);
    if (error) {
      toast.error(error.message ?? "Kod gönderilemedi.");
      return;
    }
    setOtp("");
    setStep("code");
    toast.success("Kod e-posta adresinize gönderildi.");
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendCode();
  }

  function handleResendClick() {
    void sendCode();
  }

  function handleChangeEmailClick() {
    setStep("email");
  }

  async function handleCodeComplete(code: string) {
    setIsPending(true);
    const { error } = await authClient.signIn.emailOtp({ email, otp: code });
    if (error) {
      setIsPending(false);
      setOtp("");
      toast.error(error.message ?? "Kod hatalı veya süresi dolmuş.");
      return;
    }
    // A full navigation, so the server re-reads the new session.
    window.location.assign(nextPath);
  }

  async function handleGoogleClick() {
    setIsPending(true);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: nextPath });
    if (error) {
      setIsPending(false);
      toast.error(error.message ?? "Google ile giriş başlatılamadı.");
    }
  }

  return (
    <LoginCard
      description={
        step === "email" ? EMAIL_STEP_DESCRIPTION : `${email} adresine gelen kodu girin.`
      }
    >
      {step === "email" ? (
        <>
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ornek@mail.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              Kod gönder
            </Button>
          </form>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            veya
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" onClick={handleGoogleClick} disabled={isPending}>
            Google ile devam et
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={OTP_LENGTH}
            inputMode="numeric"
            pattern="^[0-9]*$"
            autoFocus
            value={otp}
            onChange={setOtp}
            onComplete={handleCodeComplete}
            disabled={isPending}
          >
            <InputOTPGroup>
              {Array.from({ length: OTP_LENGTH }, (_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <div className="flex w-full justify-between">
            <Button variant="ghost" size="sm" onClick={handleChangeEmailClick} disabled={isPending}>
              E-postayı değiştir
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResendClick} disabled={isPending}>
              Kodu tekrar gönder
            </Button>
          </div>
        </div>
      )}
    </LoginCard>
  );
}

export function LoginFormFallback() {
  return (
    <LoginCard description={EMAIL_STEP_DESCRIPTION}>
      <div className="h-44" />
    </LoginCard>
  );
}

interface LoginCardProps {
  description: string;
  children: ReactNode;
}

function LoginCard({ description, children }: LoginCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Giriş yap</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
