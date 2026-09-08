"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { talentSchema, type TalentInput } from "@/lib/validation/schemas/talent";
import { FieldWrapper, TextInput, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

type FormValues = Omit<TalentInput, "locale" | "consent"> & { consent: boolean };

export function TalentForm() {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "en" | "ar";
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(talentSchema.omit({ locale: true })) as never });

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads/talent", {
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
      <h3 className="text-lg font-semibold text-navy-900">{t("talentForm.title")}</h3>
      {status === "error" && <Toast variant="error">{tCommon("error")}</Toast>}
      <FieldWrapper label={t("labels.fullName")} htmlFor="tl-name" required error={errors.name && t(`errors.${errors.name.message}` as never)}>
        <TextInput id="tl-name" {...register("name")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.email")} htmlFor="tl-email" required error={errors.email && t(`errors.${errors.email.message}` as never)}>
        <TextInput id="tl-email" type="email" {...register("email")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.phone")} htmlFor="tl-phone">
        <TextInput id="tl-phone" type="tel" {...register("phone")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.position")} htmlFor="tl-position">
        <TextInput id="tl-position" {...register("position")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.message")} htmlFor="tl-message">
        <TextArea id="tl-message" {...register("message")} />
      </FieldWrapper>
      <div className="flex items-start gap-3">
        <input id="tl-consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-grey-400" {...register("consent")} />
        <label htmlFor="tl-consent" className="text-sm text-slate">{t("labels.consent")}</label>
      </div>
      {errors.consent && <p role="alert" className="text-sm text-alert">{t(`errors.${errors.consent.message}` as never)}</p>}
      <Button type="submit" disabled={status === "submitting"}>{status === "submitting" ? tCommon("submitting") : tCommon("submit")}</Button>
    </form>
  );
}
