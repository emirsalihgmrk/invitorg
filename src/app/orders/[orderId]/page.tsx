import type { Metadata } from "next";
import { Suspense } from "react";

import Content, { ContentFallback } from "./content";

export const metadata: Metadata = { title: "Sipariş · Invitorg", robots: { index: false } };

export default function Page({ params }: PageProps<"/orders/[orderId]">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <Suspense fallback={<ContentFallback />}>
        <Content params={params} />
      </Suspense>
    </main>
  );
}
