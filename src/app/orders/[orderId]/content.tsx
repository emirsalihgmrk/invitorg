import { notFound } from "next/navigation";

import { getOrderService } from "@/services/order";

import OrderSummary from "./_components/order-summary";

interface ContentProps {
  params: PageProps<"/orders/[orderId]">["params"];
}

export default async function Content({ params }: ContentProps) {
  const { orderId } = await params;
  const order = await getOrderService(orderId);
  if (!order) notFound();

  return <OrderSummary order={order} />;
}

export function ContentFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
