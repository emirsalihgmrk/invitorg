import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Invitorg</h1>
      <p className="text-lg text-muted-foreground">
        Küçük etkinlikler için davet, ödeme ve girişi tek yerde çöz.
      </p>
      <div className="flex gap-3">
        <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
          Giriş yap
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          Panele git
        </Button>
      </div>
    </main>
  );
}
