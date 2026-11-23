import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/constants/event";

const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Taslak",
  published: "Yayında",
  cancelled: "İptal edildi",
  completed: "Tamamlandı",
};

const STATUS_VARIANTS = {
  draft: "outline",
  published: "default",
  cancelled: "destructive",
  completed: "secondary",
} as const satisfies Record<EventStatus, string>;

interface EventStatusBadgeProps {
  status: EventStatus;
}

export default function EventStatusBadge({ status }: EventStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
