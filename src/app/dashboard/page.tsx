import { Suspense } from "react";

import { requireUser } from "@/lib/authz";
import { SignOutButton } from "./sign-out-button";

export const metadata = { title: "Panel · Invitorg" };

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <Suspense fallback={<p className="text-muted-foreground">Yükleniyor…</p>}>
        <Greeting />
      </Suspense>
      <p className="text-muted-foreground">Etkinlikleriniz burada listelenecek (Hafta 3-4).</p>
    </main>
  );
}

async function Greeting() {
  const user = await requireUser();
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Merhaba, {user.name || user.email}</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
