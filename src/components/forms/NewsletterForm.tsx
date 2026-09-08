"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { newsletterSchema, type NewsletterInput } from "@/lib/validation/schemas/newsletter";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

type FormValues = Omit<NewsletterInput, "locale">;

export function NewsletterForm() {
  const t = useTranslations("insights");
  const tForms = useTranslations("forms");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "en" | "ar";
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(newsletterSchema.omit({ locale: true })) as never });

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
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

  if (status === "success") return <Toast>{t("newsletterCta")} ✓</Toast>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("newsletterEmailPlaceholder")}
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder={t("newsletterEmailPlaceholder")}
          className="w-full rounded-md border border-grey-200 bg-stone-050 px-3 py-2.5 text-sm"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-alert">{tForms(`errors.${errors.email.message}` as never)}</p>}
        {status === "error" && <p className="mt-1 text-sm text-alert">{tCommon("error")}</p>}
      </div>
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? tCommon("submitting") : t("newsletterCta")}
      </Button>
    </form>
  );
}
