import { LockIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isEventDeletable, isEventEditable } from "@/constants/event";
import { cn, formatEventDateTime } from "@/lib/utils";
import { getEventService } from "@/services/event";

import DeleteEventButton from "./delete-event-button";
import EventStatusBadge from "../../../../_components/event-status-badge";

interface EventDetailsProps {
  params: PageProps<"/dashboard/events/[eventId]">["params"];
}

export default async function EventDetails({ params }: EventDetailsProps) {
  const { eventId } = await params;
  const event = await getEventService(eventId);
  if (!event) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-2xl font-semibold wrap-break-word">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusBadge status={event.status} />
            {event.isPrivate && (
              <Badge variant="secondary">
                <LockIcon aria-hidden />
                Özel
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {isEventEditable(event.status) && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/dashboard/events/${event.id}/edit`} />}
            >
              <PencilIcon aria-hidden />
              Düzenle
            </Button>
          )}
          {isEventDeletable(event.status) && (
            <DeleteEventButton eventId={event.id} eventTitle={event.title} />
          )}
        </div>
      </div>
      <dl className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
        <Detail label="Tarih ve saat">{formatEventDateTime(event.startsAt)}</Detail>
        <Detail label="Kontenjan">{event.capacity} kişi</Detail>
        <Detail label="Mekân">{event.venue}</Detail>
        <Detail label="Görünürlük">
          {event.isPrivate ? "Yalnızca linke sahip olanlar" : "Herkese açık"}
        </Detail>
        <Detail label="Açıklama" isWide>
          {event.description}
        </Detail>
        <Detail label="İptal ve iade politikası" isWide>
          {event.refundPolicy}
        </Detail>
      </dl>
    </div>
  );
}

export function EventDetailsFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

interface DetailProps {
  label: string;
  // Spans both columns, for longer free text.
  isWide?: boolean;
  children: ReactNode;
}

function Detail({ label, isWide = false, children }: DetailProps) {
  return (
    <div className={cn("flex flex-col gap-1", isWide && "sm:col-span-2")}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="wrap-break-word whitespace-pre-line">{children || "—"}</dd>
    </div>
  );
}
