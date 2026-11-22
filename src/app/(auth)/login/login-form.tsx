"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const OTP_LENGTH = 6;

// Açık yönlendirme (open redirect) olmasın diye yalnızca site içi yollar kabul edilir.
function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setPending(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    setPending(false);
    if (error) return toast.error(error.message ?? "Kod gönderilemedi.");
    setOtp("");
    setStep("code");
    toast.success("Kod e-posta adresinize gönderildi.");
  }

  async function verifyCode(code: string) {
    setPending(true);
    const { error } = await authClient.signIn.emailOtp({ email, otp: code });
    if (error) {
      setPending(false);
      setOtp("");
      return toast.error(error.message ?? "Kod hatalı veya süresi dolmuş.");
    }
    router.replace(next);
    router.refresh();
  }

  async function signInWithGoogle() {
    setPending(true);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: next });
    if (error) {
      setPending(false);
      toast.error(error.message ?? "Google ile giriş başlatılamadı.");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Giriş yap</CardTitle>
        <CardDescription>
          {step === "email"
            ? "E-posta adresinize 6 haneli bir giriş kodu göndereceğiz."
            : `${email} adresine gelen kodu girin.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {step === "email" ? (
          <>
            <form onSubmit={sendCode} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@mail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={pending}>
                Kod gönder
              </Button>
            </form>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              veya
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" onClick={signInWithGoogle} disabled={pending}>
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
              onComplete={verifyCode}
              disabled={pending}
            >
              <InputOTPGroup>
                {Array.from({ length: OTP_LENGTH }, (_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <div className="flex w-full justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep("email")} disabled={pending}>
                E-postayı değiştir
              </Button>
              <Button variant="ghost" size="sm" onClick={() => sendCode()} disabled={pending}>
                Kodu tekrar gönder
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
