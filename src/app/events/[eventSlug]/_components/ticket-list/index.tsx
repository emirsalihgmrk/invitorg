import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { EventDetail, TicketType } from "@/schemas/event";
import type { TicketTypeAvailability } from "@/schemas/order";
import { getTicketAvailabilityService } from "@/services/order";

import TicketPicker from "./ticket-picker";

interface TicketListProps {
  event: EventDetail;
  isSignedIn: boolean;
}

export default async function TicketList({ event, isSignedIn }: TicketListProps) {
  if (event.ticketTypes.length === 0) return null;

  const availability = await getTicketAvailabilityService(event.slug);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Biletler</h2>
      {availability && isSignedIn ? (
        <TicketPicker
          eventSlug={event.slug}
          ticketTypes={event.ticketTypes}
          availability={availability}
        />
      ) : (
        <>
          <TicketRows ticketTypes={event.ticketTypes} availability={availability} />
          {/* Guests sign in first, so the order is placed under their account. */}
          {availability && (
            <Button
              size="lg"
              className="w-full sm:w-auto sm:self-end"
              nativeButton={false}
              render={<Link href={`/login?next=${encodeURIComponent(`/events/${event.slug}`)}`} />}
            >
              Bilet almak için giriş yapın
            </Button>
          )}
        </>
      )}
    </section>
  );
}

export function TicketListFallback() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

interface TicketRowsProps {
  ticketTypes: TicketType[];
  // null when the event does not sell tickets.
  availability: TicketTypeAvailability[] | null;
}

function TicketRows({ ticketTypes, availability }: TicketRowsProps) {
  return (
    <ul className="flex flex-col divide-y rounded-xl border">
      {ticketTypes.map((ticketType) => {
        const isSoldOut =
          availability?.find(({ ticketTypeId }) => ticketTypeId === ticketType.id)?.remaining === 0;
        return (
          <li key={ticketType.id} className="flex items-center justify-between gap-4 p-4">
            <span className="min-w-0 font-medium wrap-break-word">{ticketType.name}</span>
            <span className="flex shrink-0 items-center gap-2">
              {isSoldOut && <Badge variant="secondary">Tükendi</Badge>}
              {ticketType.price === 0 ? "Ücretsiz" : formatPrice(ticketType.price)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
