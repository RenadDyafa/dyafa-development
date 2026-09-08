"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { contactSchema, type ContactInput } from "@/lib/validation/schemas/contact";
import { FieldWrapper, TextInput, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

type FormValues = Omit<ContactInput, "locale" | "consent"> & { consent: boolean };

export function ContactForm() {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "en" | "ar";
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(contactSchema.omit({ locale: true })) as never });

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") return <Toast>{tCommon("submit")} ✓</Toast>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <h3 className="text-lg font-semibold text-navy-900">{t("contactForm.title")}</h3>
      {status === "error" && <Toast variant="error">{tCommon("error")}</Toast>}
      <FieldWrapper label={t("labels.fullName")} htmlFor="c-name" required error={errors.name && t(`errors.${errors.name.message}` as never)}>
        <TextInput id="c-name" {...register("name")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.email")} htmlFor="c-email" required error={errors.email && t(`errors.${errors.email.message}` as never)}>
        <TextInput id="c-email" type="email" {...register("email")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.phone")} htmlFor="c-phone">
        <TextInput id="c-phone" type="tel" {...register("phone")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.subject")} htmlFor="c-subject">
        <TextInput id="c-subject" {...register("subject")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.message")} htmlFor="c-message" required error={errors.message && t(`errors.${errors.message.message}` as never)}>
        <TextArea id="c-message" {...register("message")} />
      </FieldWrapper>
      <div className="flex items-start gap-3">
        <input id="c-consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-grey-400" {...register("consent")} />
        <label htmlFor="c-consent" className="text-sm text-slate">{t("labels.consent")}</label>
      </div>
      {errors.consent && <p role="alert" className="text-sm text-alert">{t(`errors.${errors.consent.message}` as never)}</p>}
      <Button type="submit" disabled={status === "submitting"}>{status === "submitting" ? tCommon("submitting") : tCommon("submit")}</Button>
    </form>
  );
}
