import { LockIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventStatus } from "@/constants/event";
import type { EventListItem } from "@/schemas/event";
import { getEventsService } from "@/services/event";

const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Taslak",
  published: "Yayında",
  cancelled: "İptal edildi",
  completed: "Tamamlandı",
};

const STATUS_VARIANTS = {
  draft: "outline",
  published: "default",
  cancelled: "destructive",
  completed: "secondary",
} as const satisfies Record<EventStatus, string>;

// Events take place in Turkey; without a fixed zone the server's (UTC) would be used.
const DATE_FORMAT = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

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
    <li className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate font-medium">{event.title}</p>
        <p className="text-sm text-muted-foreground">
          {DATE_FORMAT.format(event.startsAt)}
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
        <Badge variant={STATUS_VARIANTS[event.status]}>{STATUS_LABELS[event.status]}</Badge>
        <span className="text-sm text-muted-foreground">{event.capacity} kişi</span>
      </div>
    </li>
  );
}
