import { CalendarIcon, MapPinIcon, TimerIcon, TimerOffIcon } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/constants/order";
import { formatEventDateTime, formatPrice } from "@/lib/utils";
import type { OrderDetail } from "@/schemas/order";

import CancelOrderButton from "./cancel-order-button";
import HoldCountdown from "./hold-countdown";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Ödeme bekleniyor",
  paid: "Ödendi",
  expired: "Süresi doldu",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
};

const STATUS_VARIANTS = {
  pending: "outline",
  paid: "default",
  expired: "secondary",
  cancelled: "destructive",
  refunded: "secondary",
} as const satisfies Record<OrderStatus, string>;

interface OrderSummaryProps {
  order: OrderDetail;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const { event } = order;
  const eventPath = `/events/${event.slug}`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Siparişiniz</h1>
          <Badge variant={STATUS_VARIANTS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href={eventPath}
            className="rounded-sm text-lg font-medium wrap-break-word underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {event.title}
          </Link>
          <ul className="flex flex-col gap-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <CalendarIcon aria-hidden className="size-4 shrink-0" />
              <time dateTime={event.startsAt.toISOString()}>
                {formatEventDateTime(event.startsAt)}
              </time>
            </li>
            {event.venue && (
              <li className="flex items-center gap-2">
                <MapPinIcon aria-hidden className="size-4 shrink-0" />
                <span className="wrap-break-word">{event.venue}</span>
              </li>
            )}
          </ul>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Biletler</h2>
        <ul className="flex flex-col divide-y rounded-xl border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 p-4">
              <span className="min-w-0 wrap-break-word">
                <span className="tabular-nums">{item.quantity} ×</span> {item.ticketType.name}
              </span>
              <span className="shrink-0 tabular-nums">
                {item.unitPrice === 0 ? "Ücretsiz" : formatPrice(item.quantity * item.unitPrice)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 p-4 font-semibold">
            <span>Toplam</span>
            <span className="tabular-nums">
              {order.total === 0 ? "Ücretsiz" : formatPrice(order.total)}
            </span>
          </li>
        </ul>
      </section>

      {order.status === "pending" && (
        <div className="flex flex-col gap-4">
          <Alert role="status">
            <TimerIcon aria-hidden />
            <AlertTitle>
              Biletleriniz <HoldCountdown expiresAt={order.expiresAt} /> boyunca ayrıldı
            </AlertTitle>
            <AlertDescription>
              Süre dolmadan ödemeyi tamamlamazsanız biletler yeniden satışa açılır.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <CancelOrderButton orderId={order.id} />
            {/* Payment arrives with the provider integration (roadmap weeks 5-6, step 2). */}
            <Button size="lg" disabled>
              Ödeme yakında
            </Button>
          </div>
        </div>
      )}

      {(order.status === "expired" || order.status === "cancelled") && (
        <div className="flex flex-col gap-4">
          {order.status === "expired" && (
            <Alert role="status">
              <TimerOffIcon aria-hidden />
              <AlertTitle>Ayırma süresi doldu</AlertTitle>
              <AlertDescription>Biletler yeniden satışa açıldı.</AlertDescription>
            </Alert>
          )}
          <Button
            size="lg"
            className="sm:self-end"
            nativeButton={false}
            render={<Link href={eventPath} />}
          >
            Yeniden bilet seç
          </Button>
        </div>
      )}
    </div>
  );
}
