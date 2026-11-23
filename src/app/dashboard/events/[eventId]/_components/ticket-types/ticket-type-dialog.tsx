"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createTicketTypeAction, updateTicketTypeAction } from "@/actions/event";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createTicketTypeSchema } from "@/schemas/event";
import type { CreateTicketTypeInput, TicketType } from "@/schemas/event";

interface TicketTypeDialogProps {
  eventId: string;
  // The event capacity not yet given to other ticket types.
  maxQuota: number;
  // Edits this ticket type when given, otherwise adds a new one.
  ticketType?: TicketType;
}

export default function TicketTypeDialog({ eventId, maxQuota, ticketType }: TicketTypeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {ticketType ? (
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`${ticketType.name} bilet türünü düzenle`}
            />
          }
        >
          <PencilIcon aria-hidden />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <PlusIcon aria-hidden />
          Bilet türü ekle
        </DialogTrigger>
      )}
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{ticketType ? "Bilet türünü düzenle" : "Yeni bilet türü"}</DialogTitle>
          <DialogDescription>Örn. Standart, Erken kayıt veya Öğrenci.</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts from fresh values. */}
        <TicketTypeForm
          eventId={eventId}
          maxQuota={maxQuota}
          ticketType={ticketType}
          onSaved={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface TicketTypeFormProps extends TicketTypeDialogProps {
  onSaved: () => void;
}

function TicketTypeForm({ eventId, maxQuota, ticketType, onSaved }: TicketTypeFormProps) {
  const router = useRouter();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<CreateTicketTypeInput>({
    resolver: zodResolver(createTicketTypeSchema),
    defaultValues: {
      name: ticketType?.name ?? "",
      price: ticketType?.price,
      quota: ticketType?.quota,
    },
  });

  async function handleValidSubmit(data: CreateTicketTypeInput) {
    const result = ticketType
      ? await updateTicketTypeAction(eventId, ticketType.id, data)
      : await createTicketTypeAction(eventId, data);
    if (!result.ok) {
      setError("root", { message: result.error });
      return;
    }
    toast.success(ticketType ? "Bilet türü güncellendi." : "Bilet türü eklendi.");
    onSaved();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Ad</FieldLabel>
          <Input
            id="name"
            placeholder="Örn. Standart"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.price}>
            <FieldLabel htmlFor="price">Fiyat (TL)</FieldLabel>
            {/* The input is in lira, the form in kuruş. Uncontrolled, so a value being
                typed ("12.") is never rewritten. */}
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <Input
                  id="price"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="Örn. 750"
                  aria-invalid={!!errors.price}
                  name={field.name}
                  ref={field.ref}
                  defaultValue={field.value === undefined ? "" : field.value / 100}
                  onChange={(changeEvent) =>
                    field.onChange(
                      changeEvent.target.value === ""
                        ? undefined
                        : Math.round(Number(changeEvent.target.value) * 100),
                    )
                  }
                  onBlur={field.onBlur}
                />
              )}
            />
            <FieldDescription>Ücretsiz bilet için 0 girin.</FieldDescription>
            <FieldError errors={[errors.price]} />
          </Field>
          <Field data-invalid={!!errors.quota}>
            <FieldLabel htmlFor="quota">Kontenjan</FieldLabel>
            <Input
              id="quota"
              type="number"
              inputMode="numeric"
              placeholder="Örn. 10"
              aria-invalid={!!errors.quota}
              {...register("quota", { valueAsNumber: true })}
            />
            <FieldDescription>En fazla {maxQuota} kişi.</FieldDescription>
            <FieldError errors={[errors.quota]} />
          </Field>
        </div>
      </FieldGroup>
      <FieldError errors={[errors.root]} />
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={isSubmitting}>
          Vazgeç
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {ticketType ? "Kaydet" : "Ekle"}
        </Button>
      </DialogFooter>
    </form>
  );
}
