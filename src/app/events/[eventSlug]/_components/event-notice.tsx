import { BanIcon, CheckCircle2Icon, EyeIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { EventStatus } from "@/constants/event";
import type { EventDetail } from "@/schemas/event";

interface Notice {
  Icon: LucideIcon;
  title: string;
  description?: string;
  variant: "default" | "destructive";
}

// A published event needs no notice.
const NOTICES: Record<Exclude<EventStatus, "published">, Notice> = {
  draft: {
    Icon: EyeIcon,
    title: "Önizleme",
    description: "Etkinlik taslak olduğu için bu sayfayı yalnızca siz görebilirsiniz.",
    variant: "default",
  },
  cancelled: { Icon: BanIcon, title: "Bu etkinlik iptal edildi", variant: "destructive" },
  completed: { Icon: CheckCircle2Icon, title: "Bu etkinlik sona erdi", variant: "default" },
};

interface EventNoticeProps {
  event: EventDetail;
  isHost: boolean;
}

export default function EventNotice({ event, isHost }: EventNoticeProps) {
  const notice = event.status === "published" ? null : NOTICES[event.status];
  if (!notice && !isHost) return null;

  return (
    <div className="flex flex-col gap-3">
      {notice && (
        <Alert role="status" variant={notice.variant}>
          <notice.Icon aria-hidden />
          <AlertTitle>{notice.title}</AlertTitle>
          {notice.description && <AlertDescription>{notice.description}</AlertDescription>}
        </Alert>
      )}
      {isHost && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          nativeButton={false}
          render={<Link href={`/dashboard/events/${event.id}`} />}
        >
          Etkinliği yönet
        </Button>
      )}
    </div>
  );
}
