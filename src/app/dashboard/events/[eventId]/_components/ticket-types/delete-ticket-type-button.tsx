"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteTicketTypeAction } from "@/actions/event";
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
import type { TicketType } from "@/schemas/event";

interface DeleteTicketTypeButtonProps {
  eventId: string;
  ticketType: TicketType;
}

export default function DeleteTicketTypeButton({
  eventId,
  ticketType,
}: DeleteTicketTypeButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  function handleOpenChange(open: boolean) {
    // Keep the dialog open until the request settles.
    if (!isPending) setIsOpen(open);
  }

  async function handleDeleteClick() {
    setIsPending(true);
    const result = await deleteTicketTypeAction(eventId, ticketType.id);
    setIsPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setIsOpen(false);
    toast.success("Bilet türü silindi.");
    router.refresh();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${ticketType.name} bilet türünü sil`}
          />
        }
      >
        <Trash2Icon aria-hidden />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bilet türü silinsin mi?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{ticketType.name}&quot; bilet türü silinecek.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Vazgeç</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDeleteClick} disabled={isPending}>
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
