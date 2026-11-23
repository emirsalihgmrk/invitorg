import { Suspense } from "react";

import EditEventForm, { EditEventFormFallback } from "./_components/edit-event-form";

export const metadata = { title: "Etkinliği düzenle · Invitorg" };

export default function Page({ params }: PageProps<"/dashboard/events/[eventId]/edit">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Etkinliği düzenle</h1>
      <Suspense fallback={<EditEventFormFallback />}>
        <EditEventForm params={params} />
      </Suspense>
    </main>
  );
}
