import { LockIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDateTime } from "@/lib/utils";
import type { EventListItem } from "@/schemas/event";
import { getEventsService } from "@/services/event";

import EventStatusBadge from "./event-status-badge";

export default async function EventList() {
  const events = await getEventsService();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-10 text-center">
        <p className="text-muted-foreground">Henüz bir etkinliğiniz yok.</p>
        <Button nativeButton={false} render={<Link href="/dashboard/events/new" />}>
          İlk etkinliğini oluştur
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y rounded-xl border">
      {events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </ul>
  );
}

export function EventListFallback() {
  return (
    <div className="flex flex-col divide-y rounded-xl border">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex flex-col gap-2 p-4">
          <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface EventRowProps {
  event: EventListItem;
}

function EventRow({ event }: EventRowProps) {
  return (
    // The link's ::after covers the row, so the whole row is clickable.
    <li className="relative flex flex-col gap-2 p-4 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <Link
          href={`/dashboard/events/${event.id}`}
          className="truncate font-medium outline-none after:absolute after:inset-0"
        >
          {event.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {formatEventDateTime(event.startsAt)}
          {event.venue && ` · ${event.venue}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {event.isPrivate && (
          <Badge variant="secondary">
            <LockIcon aria-hidden />
            Özel
          </Badge>
        )}
        <EventStatusBadge status={event.status} />
        <span className="text-sm text-muted-foreground">{event.capacity} kişi</span>
      </div>
    </li>
  );
}
