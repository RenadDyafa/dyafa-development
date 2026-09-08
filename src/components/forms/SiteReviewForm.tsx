"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  siteReviewSchema,
  type SiteReviewInput,
  LEAD_ROLES,
  LEGAL_STATUSES,
  ASSET_TYPES,
  OPPORTUNITY_INTENTS,
  TIMELINES,
  MAX_FILES,
} from "@/lib/validation/schemas/siteReview";
import { FieldWrapper, TextInput, TextArea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Stepper } from "@/components/ui/Stepper";
import { env } from "@/lib/env";
import { track } from "@/lib/analytics/track";

type FormValues = Omit<SiteReviewInput, "locale" | "consent"> & { consent: boolean };

const DRAFT_KEY = "dyafa:site-review-draft";
const STEP_KEYS = ["intent", "contact", "opportunity", "context", "documents"] as const;

// Per-step field lists for react-hook-form's trigger(), so "Next" only
// validates the fields visible on the current step.
const STEP_FIELDS: (keyof FormValues)[][] = [
  ["opportunityIntent"],
  ["name", "role", "organization", "email", "phone"],
  ["city", "landLocation", "landAreaM2", "legalStatus", "assetType"],
  ["timeline", "message"],
  ["consent"],
];

export function SiteReviewForm({ campaignId }: { campaignId?: string }) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tWizard = useTranslations("siteReviewWizard");
  const tSite = useTranslations("submitYourSite");
  const locale = useLocale() as "en" | "ar";
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [step, setStep] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [startTracked, setStartTracked] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(siteReviewSchema.omit({ locale: true })) as never,
  });

  // Restore an in-progress draft (file inputs excluded - they can't be
  // serialized) so a refresh or accidental tab close doesn't cost the
  // visitor a re-fill.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) reset(JSON.parse(raw));
    } catch {
      // Corrupt/unavailable storage - start fresh, non-fatal.
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((values) => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        // Storage unavailable (private mode, quota) - draft persistence is
        // an enhancement, not required for submission to work.
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (!startTracked) {
      track("submit_site_start");
      setStartTracked(true);
    }
  }, [startTracked]);

  const errorText = (key?: string) => (key ? t(`errors.${key}` as never) : undefined);

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step] as never);
    if (!valid) return;
    track("submit_site_step_completed", { step: STEP_KEYS[step]! });
    setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    try {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("role", values.role);
      if (values.organization) formData.set("organization", values.organization);
      formData.set("email", values.email);
      formData.set("phone", values.phone);
      formData.set("city", values.city);
      if (values.landLocation) formData.set("landLocation", values.landLocation);
      if (values.landAreaM2) formData.set("landAreaM2", String(values.landAreaM2));
      if (values.legalStatus) formData.set("legalStatus", values.legalStatus);
      if (values.assetType) formData.set("assetType", values.assetType);
      if (values.opportunityIntent) formData.set("opportunityIntent", values.opportunityIntent);
      if (values.timeline) formData.set("timeline", values.timeline);
      if (values.message) formData.set("message", values.message);
      formData.set("locale", locale);
      formData.set("consent", values.consent ? "true" : "false");
      if (campaignId) formData.set("campaignId", campaignId);

      const fileInput = document.getElementById("documents") as HTMLInputElement | null;
      if (fileInput?.files && fileInput.files.length > 0) {
        Array.from(fileInput.files)
          .slice(0, MAX_FILES)
          .forEach((file) => formData.append("documents", file));
        track("document_uploaded", { count: String(Math.min(fileInput.files.length, MAX_FILES)) });
      }

      const res = await fetch("/api/leads/site-review", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error("submit_failed");

      track("submit_site_submitted");
      setReferenceNumber(json.data?.referenceNumber ?? null);
      setStatus("success");
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // Non-fatal.
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    const waNumber = env.whatsappNumber;
    return (
      <div className="rounded-lg border border-teal-300 bg-teal-050 p-8">
        <h2 className="text-xl font-bold text-navy-900">{tWizard("successTitle")}</h2>
        <p className="mt-2 text-slate">{tWizard("successBody")}</p>
        {referenceNumber && (
          <p className="mt-4 rounded-md bg-stone-050 px-4 py-3 text-sm">
            <span className="text-grey-600">{tWizard("referenceLabel")}: </span>
            <span className="font-mono font-semibold text-navy-900">{referenceNumber}</span>
          </p>
        )}

        <h3 className="mt-6 text-sm font-semibold text-navy-900">{tWizard("funnelTitle")}</h3>
        <ol className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate">
          {(["received", "review", "qualification", "discussion"] as const).map((k, i) => (
            <li key={k} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="text-grey-600">
                  →
                </span>
              )}
              {tWizard(`funnelStages.${k}`)}
            </li>
          ))}
        </ol>

        {waNumber && (
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            {tSite("whatsappCta")}
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {status === "error" && <Toast variant="error">{tCommon("error")}</Toast>}

      {/* Honeypot */}
      <input type="text" tabIndex={-1} autoComplete="off" {...register("website" as never)} className="hidden" aria-hidden="true" />

      <Stepper
        steps={STEP_KEYS.map((k) => tWizard(`steps.${k}`))}
        currentIndex={step}
        onStepClick={(i) => setStep(i)}
      />

      {step === 0 && (
        <div>
          <p className="text-sm font-medium text-navy-900">{tWizard("intentTitle")}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {OPPORTUNITY_INTENTS.map((intent) => (
              <label
                key={intent}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-grey-200 px-3 py-2.5 text-sm has-[:checked]:border-bronze has-[:checked]:bg-bronze/5"
              >
                <input type="radio" value={intent} {...register("opportunityIntent")} className="h-4 w-4" />
                {tWizard(`intentOptions.${intent}`)}
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldWrapper label={t("labels.fullName")} htmlFor="name" required error={errorText(errors.name?.message)}>
            <TextInput id="name" {...register("name")} />
          </FieldWrapper>
          <FieldWrapper label={t("labels.role")} htmlFor="role" required error={errorText(errors.role?.message)}>
            <Select id="role" {...register("role")} defaultValue="">
              <option value="" disabled>
                —
              </option>
              {LEAD_ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`roles.${role === "hotel_owner" ? "hotelOwner" : role}` as never)}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label={t("labels.organization")} htmlFor="organization" error={errorText(errors.organization?.message)}>
            <TextInput id="organization" {...register("organization")} />
          </FieldWrapper>
          <FieldWrapper label={t("labels.email")} htmlFor="email" required error={errorText(errors.email?.message)}>
            <TextInput id="email" type="email" {...register("email")} />
          </FieldWrapper>
          <FieldWrapper label={t("labels.phone")} htmlFor="phone" required error={errorText(errors.phone?.message)}>
            <TextInput id="phone" type="tel" {...register("phone")} />
          </FieldWrapper>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldWrapper label={t("labels.city")} htmlFor="city" required error={errorText(errors.city?.message)}>
            <TextInput id="city" {...register("city")} />
          </FieldWrapper>
          <FieldWrapper label={t("labels.landLocation")} htmlFor="landLocation" error={errorText(errors.landLocation?.message)}>
            <TextInput id="landLocation" {...register("landLocation")} />
          </FieldWrapper>
          <FieldWrapper label={t("labels.landAreaM2")} htmlFor="landAreaM2" error={errorText(errors.landAreaM2?.message)}>
            <TextInput
              id="landAreaM2"
              type="number"
              min={0}
              step="any"
              {...register("landAreaM2", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
            />
          </FieldWrapper>
          <FieldWrapper label={t("labels.legalStatus")} htmlFor="legalStatus" error={errorText(errors.legalStatus?.message)}>
            <Select id="legalStatus" {...register("legalStatus", { setValueAs: (v) => (v === "" ? undefined : v) })} defaultValue="">
              <option value="">—</option>
              {LEGAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`legalStatuses.${s}` as never)}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label={t("labels.assetType")} htmlFor="assetType" error={errorText(errors.assetType?.message)}>
            <Select id="assetType" {...register("assetType", { setValueAs: (v) => (v === "" ? undefined : v) })} defaultValue="">
              <option value="">—</option>
              {ASSET_TYPES.map((s) => (
                <option key={s} value={s}>
                  {t(`assetTypes.${s === "raw_land" ? "rawLand" : s === "existing_building" ? "existingBuilding" : "underperformingHotel"}` as never)}
                </option>
              ))}
            </Select>
          </FieldWrapper>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <FieldWrapper label={tWizard("timelineLabel")} htmlFor="timeline" error={errorText(errors.timeline?.message)}>
            <Select id="timeline" {...register("timeline", { setValueAs: (v) => (v === "" ? undefined : v) })} defaultValue="">
              <option value="">—</option>
              {TIMELINES.map((tl) => (
                <option key={tl} value={tl}>
                  {tWizard(`timelineOptions.${tl}`)}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label={t("labels.message")} htmlFor="message" error={errorText(errors.message?.message)}>
            <TextArea id="message" {...register("message")} />
          </FieldWrapper>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <FieldWrapper label={t("labels.documents")} htmlFor="documents">
            <input
              id="documents"
              name="documents"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg"
              className="block w-full text-sm text-slate file:mr-4 file:rounded-md file:border-0 file:bg-teal-050 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-600"
            />
          </FieldWrapper>

          <div className="flex items-start gap-3">
            <input id="consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-grey-400" {...register("consent")} />
            <label htmlFor="consent" className="text-sm text-slate">
              {t("labels.consent")}
            </label>
          </div>
          {errors.consent && (
            <p role="alert" className="text-sm text-alert">
              {errorText(errors.consent.message)}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-grey-100 pt-5">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={goBack}>
            {tWizard("back")}
          </Button>
        ) : (
          <span />
        )}

        {step < STEP_KEYS.length - 1 ? (
          <Button type="button" onClick={goNext}>
            {tWizard("next")}
          </Button>
        ) : (
          <Button type="submit" size="lg" disabled={status === "submitting"}>
            {status === "submitting" ? tCommon("submitting") : tWizard("submit")}
          </Button>
        )}
      </div>
    </form>
  );
}
