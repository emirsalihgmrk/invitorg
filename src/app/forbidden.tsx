import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Erişim yok</h1>
      <p className="text-muted-foreground">Bu sayfayı görüntüleme yetkiniz bulunmuyor.</p>
      <Button nativeButton={false} render={<Link href="/dashboard" />}>
        Panele dön
      </Button>
    </main>
  );
}
