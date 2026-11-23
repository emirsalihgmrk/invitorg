import EventForm from "../_components/event-form";

export const metadata = { title: "Yeni etkinlik · Invitorg" };

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Yeni etkinlik</h1>
        <p className="text-sm text-muted-foreground">
          Etkinlik taslak olarak kaydedilir. Bilet türlerini ekledikten sonra yayınlayabilirsiniz.
        </p>
      </div>
      <EventForm />
    </main>
  );
}
