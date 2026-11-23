import { notFound, redirect } from "next/navigation";

import { isEventEditable } from "@/constants/event";
import { getEventService } from "@/services/event";

import EventForm from "../../../_components/event-form";

interface EditEventFormProps {
  params: PageProps<"/dashboard/events/[eventId]/edit">["params"];
}

export default async function EditEventForm({ params }: EditEventFormProps) {
  const { eventId } = await params;
  const event = await getEventService(eventId);
  if (!event) notFound();
  // Cancelled and completed events are final, so the host lands on the details page.
  if (!isEventEditable(event.status)) redirect(`/dashboard/events/${event.id}`);

  return <EventForm event={event} />;
}

export function EditEventFormFallback() {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-9 animate-pulse rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}
