import { CalendarIcon, MapPinIcon } from "lucide-react";

import { formatEventDateTime } from "@/lib/utils";
import type { EventDetail } from "@/schemas/event";

interface EventHeroProps {
  event: EventDetail;
}

export default function EventHero({ event }: EventHeroProps) {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight wrap-break-word">{event.title}</h1>
      <ul className="flex flex-col gap-2 text-muted-foreground">
        <li className="flex items-center gap-2">
          <CalendarIcon aria-hidden className="size-4 shrink-0" />
          <time dateTime={event.startsAt.toISOString()}>{formatEventDateTime(event.startsAt)}</time>
        </li>
        {event.venue && (
          <li className="flex items-center gap-2">
            <MapPinIcon aria-hidden className="size-4 shrink-0" />
            <span className="wrap-break-word">{event.venue}</span>
          </li>
        )}
      </ul>
      {event.description && (
        <p className="leading-relaxed wrap-break-word whitespace-pre-line">{event.description}</p>
      )}
    </header>
  );
}
