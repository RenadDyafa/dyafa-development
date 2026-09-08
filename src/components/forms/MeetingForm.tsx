"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { meetingSchema, type MeetingInput } from "@/lib/validation/schemas/meeting";
import { LEAD_ROLES } from "@/lib/validation/schemas/siteReview";
import { FieldWrapper, TextInput, TextArea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

type FormValues = Omit<MeetingInput, "locale" | "consent"> & { consent: boolean };

export function MeetingForm() {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "en" | "ar";
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(meetingSchema.omit({ locale: true })) as never });

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads/meeting", {
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
      <h3 className="text-lg font-semibold text-navy-900">{t("meeting.title")}</h3>
      {status === "error" && <Toast variant="error">{tCommon("error")}</Toast>}
      <FieldWrapper label={t("labels.fullName")} htmlFor="m-name" required error={errors.name && t(`errors.${errors.name.message}` as never)}>
        <TextInput id="m-name" {...register("name")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.role")} htmlFor="m-role" required error={errors.role && t(`errors.${errors.role.message}` as never)}>
        <Select id="m-role" {...register("role")} defaultValue="">
          <option value="" disabled>—</option>
          {LEAD_ROLES.map((role) => (
            <option key={role} value={role}>{t(`roles.${role === "hotel_owner" ? "hotelOwner" : role}` as never)}</option>
          ))}
        </Select>
      </FieldWrapper>
      <FieldWrapper label={t("labels.organization")} htmlFor="m-org">
        <TextInput id="m-org" {...register("organization")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.email")} htmlFor="m-email" required error={errors.email && t(`errors.${errors.email.message}` as never)}>
        <TextInput id="m-email" type="email" {...register("email")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.phone")} htmlFor="m-phone" required error={errors.phone && t(`errors.${errors.phone.message}` as never)}>
        <TextInput id="m-phone" type="tel" {...register("phone")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.preferredDate")} htmlFor="m-date">
        <TextInput id="m-date" type="date" {...register("preferredDate")} />
      </FieldWrapper>
      <FieldWrapper label={t("labels.message")} htmlFor="m-message">
        <TextArea id="m-message" {...register("message")} />
      </FieldWrapper>
      <div className="flex items-start gap-3">
        <input id="m-consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-grey-400" {...register("consent")} />
        <label htmlFor="m-consent" className="text-sm text-slate">{t("labels.consent")}</label>
      </div>
      {errors.consent && <p role="alert" className="text-sm text-alert">{t(`errors.${errors.consent.message}` as never)}</p>}
      <Button type="submit" disabled={status === "submitting"}>{status === "submitting" ? tCommon("submitting") : tCommon("submit")}</Button>
    </form>
  );
}
