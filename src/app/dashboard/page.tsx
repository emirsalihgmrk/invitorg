import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

import EventList, { EventListFallback } from "./_components/event-list";
import Greeting, { GreetingFallback } from "./_components/greeting";

export const metadata = { title: "Panel · Invitorg" };

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <Suspense fallback={<GreetingFallback />}>
        <Greeting />
      </Suspense>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Etkinliklerim</h2>
          <Button nativeButton={false} render={<Link href="/dashboard/events/new" />}>
            <PlusIcon aria-hidden />
            Yeni etkinlik
          </Button>
        </div>
        <Suspense fallback={<EventListFallback />}>
          <EventList />
        </Suspense>
      </section>
    </main>
  );
}
