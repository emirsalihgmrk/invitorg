"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createEventAction, editEventAction } from "@/actions/event";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "@/lib/utils";
import { createEventSchema } from "@/schemas/event";
import type { CreateEventInput, EventDetail } from "@/schemas/event";

interface EventFormProps {
  // Edits this event when given, otherwise creates a new draft.
  event?: EventDetail;
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const {
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
    setError,
  } = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      venue: event?.venue ?? "",
      startsAt: event?.startsAt,
      capacity: event?.capacity,
      isPrivate: event?.isPrivate ?? false,
      refundPolicy: event?.refundPolicy ?? "",
    },
  });
  // Stays disabled after success too, so the form can't be resent while navigating.
  const isDisabled = isSubmitting || isSubmitSuccessful;
  const cancelHref = event ? `/dashboard/events/${event.id}` : "/dashboard";

  async function handleValidSubmit(data: CreateEventInput) {
    if (event) {
      const result = await editEventAction(event.id, data);
      if (!result.ok) {
        // A root error also marks the submit as unsuccessful, re-enabling the form.
        setError("root", { message: result.error });
        return;
      }
      toast.success("Değişiklikler kaydedildi.");
      router.push(`/dashboard/events/${event.id}`);
      return;
    }

    const result = await createEventAction(data);
    if (!result.ok) {
      setError("root", { message: result.error });
      return;
    }
    toast.success("Etkinlik taslak olarak oluşturuldu.");
    router.push(`/dashboard/events/${result.data}`);
  }

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Başlık</FieldLabel>
          <Input
            id="title"
            placeholder="Örn. Ege mutfağı akşam yemeği"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          <FieldError errors={[errors.title]} />
        </Field>
        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Açıklama</FieldLabel>
          <Textarea
            id="description"
            placeholder="Misafirlerin bilmesi gerekenler"
            rows={4}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.startsAt}>
            <FieldLabel htmlFor="startsAt">Tarih ve saat</FieldLabel>
            {/* The input holds a zone-less string, the form a Date in Turkish time. It
                stays uncontrolled: clearing one segment reports "", and writing that back
                would wipe the whole input. */}
            <Controller
              control={control}
              name="startsAt"
              render={({ field }) => (
                <Input
                  id="startsAt"
                  type="datetime-local"
                  aria-invalid={!!errors.startsAt}
                  name={field.name}
                  ref={field.ref}
                  defaultValue={field.value ? toDateTimeLocalValue(field.value) : ""}
                  onChange={(changeEvent) =>
                    field.onChange(
                      changeEvent.target.value
                        ? fromDateTimeLocalValue(changeEvent.target.value)
                        : undefined,
                    )
                  }
                  onBlur={field.onBlur}
                />
              )}
            />
            <FieldError errors={[errors.startsAt]} />
          </Field>
          <Field data-invalid={!!errors.capacity}>
            <FieldLabel htmlFor="capacity">Kontenjan</FieldLabel>
            <Input
              id="capacity"
              type="number"
              inputMode="numeric"
              placeholder="Örn. 12"
              aria-invalid={!!errors.capacity}
              {...register("capacity", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.capacity]} />
          </Field>
        </div>
        <Field data-invalid={!!errors.venue}>
          <FieldLabel htmlFor="venue">Mekân</FieldLabel>
          <Input
            id="venue"
            placeholder="Adres veya mekân adı"
            aria-invalid={!!errors.venue}
            {...register("venue")}
          />
          <FieldError errors={[errors.venue]} />
        </Field>
        <Field data-invalid={!!errors.refundPolicy}>
          <FieldLabel htmlFor="refundPolicy">İptal ve iade politikası</FieldLabel>
          <Textarea
            id="refundPolicy"
            placeholder="Örn. Etkinlikten 48 saat öncesine kadar tam iade"
            rows={3}
            aria-invalid={!!errors.refundPolicy}
            {...register("refundPolicy")}
          />
          <FieldError errors={[errors.refundPolicy]} />
        </Field>
        <FieldLabel>
          <Field orientation="horizontal">
            <Controller
              control={control}
              name="isPrivate"
              render={({ field }) => (
                <Checkbox
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <FieldContent>
              <FieldTitle>Özel etkinlik</FieldTitle>
              <FieldDescription>
                Etkinlik sayfasına yalnızca linke sahip olanlar ulaşabilir.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldError errors={[errors.root]} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={cancelHref} />}
            disabled={isDisabled}
          >
            Vazgeç
          </Button>
          <Button type="submit" disabled={isDisabled}>
            {event ? "Değişiklikleri kaydet" : "Taslak olarak kaydet"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
