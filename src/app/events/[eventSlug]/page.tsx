import type { Metadata } from "next";
import { Suspense } from "react";

import { isEventVisible } from "@/constants/event";
import { getEventBySlugService } from "@/services/event";

import Content, { ContentFallback } from "./content";

export async function generateMetadata({
  params,
}: PageProps<"/events/[eventSlug]">): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = await getEventBySlugService(eventSlug);
  if (!event) return { title: "Etkinlik bulunamadı · Invitorg", robots: { index: false } };

  return {
    title: `${event.title} · Invitorg`,
    description: event.description?.slice(0, 160),
    // A private event is shared only by its link, so search engines must not list it.
    robots: { index: !event.isPrivate && isEventVisible(event.status) },
  };
}

export default function Page({ params }: PageProps<"/events/[eventSlug]">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10">
      <Suspense fallback={<ContentFallback />}>
        <Content params={params} />
      </Suspense>
    </main>
  );
}
