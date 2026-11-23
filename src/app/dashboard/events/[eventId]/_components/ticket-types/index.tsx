import { areTicketTypesEditable } from "@/constants/event";
import { formatPrice } from "@/lib/utils";
import type { EventDetail } from "@/schemas/event";

import DeleteTicketTypeButton from "./delete-ticket-type-button";
import TicketTypeDialog from "./ticket-type-dialog";

interface TicketTypesProps {
  event: EventDetail;
}

export default function TicketTypes({ event }: TicketTypesProps) {
  const allocated = event.ticketTypes.reduce((sum, ticketType) => sum + ticketType.quota, 0);
  const remaining = event.capacity - allocated;
  const isEditable = areTicketTypesEditable(event.status);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Bilet türleri</h2>
          <p className="text-sm text-muted-foreground">
            {event.capacity} kişilik kontenjanın {allocated} kişisi dağıtıldı
          </p>
        </div>
        {isEditable && remaining > 0 && (
          <TicketTypeDialog eventId={event.id} maxQuota={remaining} />
        )}
      </div>
      {event.ticketTypes.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Henüz bilet türü yok. Misafirlerin bilet alabilmesi için en az bir bilet türü ekleyin.
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-xl border">
          {event.ticketTypes.map((ticketType) => (
            <li key={ticketType.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="truncate font-medium">{ticketType.name}</p>
                <p className="text-sm text-muted-foreground">
                  {ticketType.price === 0 ? "Ücretsiz" : formatPrice(ticketType.price)} ·{" "}
                  {ticketType.quota} kişi
                </p>
              </div>
              {isEditable && (
                <div className="flex shrink-0 gap-1">
                  <TicketTypeDialog
                    eventId={event.id}
                    maxQuota={remaining + ticketType.quota}
                    ticketType={ticketType}
                  />
                  <DeleteTicketTypeButton eventId={event.id} ticketType={ticketType} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!isEditable && (
        <p className="text-sm text-muted-foreground">
          Bilet türleri yalnızca etkinlik taslak aşamasındayken değiştirilebilir.
        </p>
      )}
    </section>
  );
}
