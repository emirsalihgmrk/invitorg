"use client";

import { BanIcon, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { cancelEventAction, publishEventAction } from "@/actions/event";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const STATUS_CHANGES = {
  published: {
    action: publishEventAction,
    Icon: SendIcon,
    variant: "default",
    label: "Yayınla",
    title: "Etkinlik yayınlansın mı?",
    description:
      "Etkinlik sayfası misafirlere açılır. Yayınladıktan sonra bilet türleri değiştirilemez ve etkinlik taslağa geri alınamaz.",
    confirmLabel: "Yayınla",
    successMessage: "Etkinlik yayınlandı.",
  },
  cancelled: {
    action: cancelEventAction,
    Icon: BanIcon,
    variant: "destructive",
    label: "İptal et",
    title: "Etkinlik iptal edilsin mi?",
    description:
      "İptal edilen etkinlik yeniden yayınlanamaz ve düzenlenemez. Bu işlem geri alınamaz.",
    confirmLabel: "Etkinliği iptal et",
    successMessage: "Etkinlik iptal edildi.",
  },
} as const;

interface ChangeEventStatusButtonProps {
  eventId: string;
  status: keyof typeof STATUS_CHANGES;
}

export default function ChangeEventStatusButton({ eventId, status }: ChangeEventStatusButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const change = STATUS_CHANGES[status];

  function handleOpenChange(open: boolean) {
    // Keep the dialog open until the request settles.
    if (!isPending) setIsOpen(open);
  }

  async function handleConfirmClick() {
    setIsPending(true);
    const result = await change.action(eventId);
    setIsPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setIsOpen(false);
    toast.success(change.successMessage);
    router.refresh();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<Button variant={change.variant} />}>
        <change.Icon aria-hidden />
        {change.label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{change.title}</AlertDialogTitle>
          <AlertDialogDescription>{change.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Vazgeç</AlertDialogCancel>
          <AlertDialogAction
            variant={change.variant}
            onClick={handleConfirmClick}
            disabled={isPending}
          >
            {change.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
