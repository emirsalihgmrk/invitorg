import { formatPrice } from "@/lib/utils";
import type { EventDetail } from "@/schemas/event";

interface TicketListProps {
  event: EventDetail;
}

export default function TicketList({ event }: TicketListProps) {
  if (event.ticketTypes.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Biletler</h2>
      <ul className="flex flex-col divide-y rounded-xl border">
        {event.ticketTypes.map((ticketType) => (
          <li key={ticketType.id} className="flex items-center justify-between gap-4 p-4">
            <span className="min-w-0 font-medium wrap-break-word">{ticketType.name}</span>
            <span className="shrink-0">
              {ticketType.price === 0 ? "Ücretsiz" : formatPrice(ticketType.price)}
            </span>
          </li>
        ))}
      </ul>
      {/* Checkout arrives with orders and payment (roadmap weeks 5-6). */}
      {event.status === "published" && (
        <p className="text-sm text-muted-foreground">Bilet satışı yakında açılacak.</p>
      )}
    </section>
  );
}
