import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUserService } from "@/services/auth";
import { getEventBySlugService } from "@/services/event";
import { getTicketAvailabilityService } from "@/services/order";

import EventHero from "./_components/event-hero";
import EventNotice from "./_components/event-notice";
import RefundPolicy from "./_components/refund-policy";
import TicketList, { TicketListFallback } from "./_components/ticket-list";

interface ContentProps {
  params: PageProps<"/events/[eventSlug]">["params"];
}

// One read returns the event with its ticket types, so the sections below
// render from props; only the seat availability loads on its own.
export default async function Content({ params }: ContentProps) {
  const { eventSlug } = await params;
  // Started alongside the event read; TicketList's call then hits React.cache.
  void getTicketAvailabilityService(eventSlug);
  const [user, event] = await Promise.all([
    getCurrentUserService(),
    getEventBySlugService(eventSlug),
  ]);
  if (!event) notFound();

  return (
    <>
      <EventNotice event={event} isHost={event.hostId === user?.id} />
      <EventHero event={event} />
      <Suspense fallback={<TicketListFallback />}>
        <TicketList event={event} isSignedIn={user !== null} />
      </Suspense>
      {event.refundPolicy && <RefundPolicy refundPolicy={event.refundPolicy} />}
    </>
  );
}

export function ContentFallback() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="h-9 w-3/4 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
