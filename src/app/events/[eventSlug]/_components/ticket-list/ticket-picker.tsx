"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { placeOrderAction } from "@/actions/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MAX_SEATS_PER_ORDER, ORDER_HOLD_MINUTES } from "@/constants/order";
import { formatPrice } from "@/lib/utils";
import type { TicketType } from "@/schemas/event";
import type { TicketTypeAvailability } from "@/schemas/order";

// Below this, the remaining seats are shown so guests know to hurry.
const FEW_SEATS_LEFT = 5;

interface TicketPickerProps {
  eventSlug: string;
  ticketTypes: TicketType[];
  availability: TicketTypeAvailability[];
}

export default function TicketPicker({ eventSlug, ticketTypes, availability }: TicketPickerProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isPending, setIsPending] = useState(false);

  const selectedCount = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const total = ticketTypes.reduce(
    (sum, ticketType) => sum + (quantities[ticketType.id] ?? 0) * ticketType.price,
    0,
  );

  function getRemaining(ticketTypeId: string): number {
    return availability.find((item) => item.ticketTypeId === ticketTypeId)?.remaining ?? 0;
  }

  function handleQuantityChange(ticketTypeId: string, quantity: number) {
    setQuantities((current) => ({ ...current, [ticketTypeId]: quantity }));
  }

  async function handleContinueClick() {
    setIsPending(true);
    const items = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));
    const result = await placeOrderAction(eventSlug, { items });
    if (!result.ok) {
      setIsPending(false);
      toast.error(result.error);
      // Seats may have been taken meanwhile; show the current availability.
      router.refresh();
      return;
    }
    router.push(`/orders/${result.data}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y rounded-xl border">
        {ticketTypes.map((ticketType) => {
          const quantity = quantities[ticketType.id] ?? 0;
          const remaining = getRemaining(ticketType.id);
          const max = Math.min(remaining, quantity + MAX_SEATS_PER_ORDER - selectedCount);
          return (
            <li key={ticketType.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-medium wrap-break-word">{ticketType.name}</span>
                <span className="text-sm text-muted-foreground">
                  {ticketType.price === 0 ? "Ücretsiz" : formatPrice(ticketType.price)}
                  {remaining > 0 && remaining <= FEW_SEATS_LEFT && ` · ${remaining} yer kaldı`}
                </span>
              </div>
              {remaining === 0 ? (
                <Badge variant="secondary">Tükendi</Badge>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label={`${ticketType.name} adedini azalt`}
                    disabled={isPending || quantity === 0}
                    onClick={() => handleQuantityChange(ticketType.id, quantity - 1)}
                  >
                    <MinusIcon aria-hidden />
                  </Button>
                  <span className="w-6 text-center font-medium tabular-nums" aria-live="polite">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label={`${ticketType.name} adedini artır`}
                    disabled={isPending || quantity >= max}
                    onClick={() => handleQuantityChange(ticketType.id, quantity + 1)}
                  >
                    <PlusIcon aria-hidden />
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Toplam</span>
          <span className="text-lg font-semibold tabular-nums">
            {total === 0 ? "Ücretsiz" : formatPrice(total)}
          </span>
        </div>
        <Button
          size="lg"
          className="px-6"
          disabled={isPending || selectedCount === 0}
          onClick={handleContinueClick}
        >
          Devam et
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Seçtiğiniz biletler ödemeyi tamamlamanız için {ORDER_HOLD_MINUTES} dakika boyunca size
        ayrılır. En fazla {MAX_SEATS_PER_ORDER} bilet seçebilirsiniz.
      </p>
    </div>
  );
}
