import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

import Content, { ContentFallback } from "./content";

export const metadata = { title: "Etkinlik · Invitorg" };

export default function Page({ params }: PageProps<"/dashboard/events/[eventId]">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        <ArrowLeftIcon aria-hidden />
        Etkinliklerim
      </Button>
      <Suspense fallback={<ContentFallback />}>
        <Content params={params} />
      </Suspense>
    </main>
  );
}
