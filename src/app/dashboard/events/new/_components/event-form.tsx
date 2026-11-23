"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createEventAction } from "@/actions/event";
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
import { createEventSchema } from "@/schemas/event";
import type { CreateEventInput } from "@/schemas/event";

export default function EventForm() {
  const router = useRouter();
  const {
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
    setError,
  } = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: { title: "", description: "", venue: "", isPrivate: false, refundPolicy: "" },
  });
  // Stays disabled after success too, so the form can't be resent while navigating.
  const isDisabled = isSubmitting || isSubmitSuccessful;

  async function handleValidSubmit(data: CreateEventInput) {
    const result = await createEventAction(data);
    if (!result.ok) {
      // A root error also marks the submit as unsuccessful, re-enabling the form.
      setError("root", { message: result.error });
      return;
    }
    toast.success("Etkinlik taslak olarak oluşturuldu.");
    router.push("/dashboard");
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
            {/* datetime-local has no zone, so the value is read in the host's browser zone. */}
            <Input
              id="startsAt"
              type="datetime-local"
              aria-invalid={!!errors.startsAt}
              {...register("startsAt", { valueAsDate: true })}
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
            render={<Link href="/dashboard" />}
            disabled={isDisabled}
          >
            Vazgeç
          </Button>
          <Button type="submit" disabled={isDisabled}>
            Taslak olarak kaydet
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
