import { Suspense } from "react";

import Greeting, { GreetingFallback } from "./_components/greeting";

export const metadata = { title: "Panel · Invitorg" };

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <Suspense fallback={<GreetingFallback />}>
        <Greeting />
      </Suspense>
      <p className="text-muted-foreground">Etkinlikleriniz burada listelenecek (Hafta 3-4).</p>
    </main>
  );
}
