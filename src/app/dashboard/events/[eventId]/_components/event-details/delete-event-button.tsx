"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteEventAction } from "@/actions/event";
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

interface DeleteEventButtonProps {
  eventId: string;
  eventTitle: string;
}

export default function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  function handleOpenChange(open: boolean) {
    // Keep the dialog open until the request settles.
    if (!isPending) setIsOpen(open);
  }

  async function handleDeleteClick() {
    setIsPending(true);
    const result = await deleteEventAction(eventId);
    if (!result.ok) {
      setIsPending(false);
      toast.error(result.error);
      return;
    }
    toast.success("Etkinlik silindi.");
    router.push("/dashboard");
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon aria-hidden />
        Sil
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Etkinlik silinsin mi?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{eventTitle}&quot; kalıcı olarak silinecek. Bu işlem geri alınamaz.
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
