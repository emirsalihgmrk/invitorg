import { notFound } from "next/navigation";

import { getEventService } from "@/services/event";

import EventDetails from "./_components/event-details";
import TicketTypes from "./_components/ticket-types";

interface ContentProps {
  params: PageProps<"/dashboard/events/[eventId]">["params"];
}

// One read returns the event with its ticket types, so the sections below
// render from props and need no boundaries of their own.
export default async function Content({ params }: ContentProps) {
  const { eventId } = await params;
  const event = await getEventService(eventId);
  if (!event) notFound();

  return (
    <>
      <EventDetails event={event} />
      <TicketTypes event={event} />
    </>
  );
}

export function ContentFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
