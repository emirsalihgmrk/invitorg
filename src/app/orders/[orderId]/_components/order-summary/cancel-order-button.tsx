"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { cancelOrderAction } from "@/actions/order";
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

interface CancelOrderButtonProps {
  orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  function handleOpenChange(open: boolean) {
    // Keep the dialog open until the request settles.
    if (!isPending) setIsOpen(open);
  }

  async function handleCancelClick() {
    setIsPending(true);
    const result = await cancelOrderAction(orderId);
    setIsPending(false);
    setIsOpen(false);
    if (!result.ok) {
      toast.error(result.error);
    } else {
      toast.success("Sipariş iptal edildi.");
    }
    router.refresh();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<Button variant="outline" size="lg" />}>
        Siparişten vazgeç
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Siparişten vazgeçilsin mi?</AlertDialogTitle>
          <AlertDialogDescription>
            Sizin için ayrılan biletler yeniden satışa açılacak.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Geri dön</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleCancelClick} disabled={isPending}>
            Vazgeç
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
