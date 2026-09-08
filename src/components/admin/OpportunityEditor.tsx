"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WorkflowStatusBar } from "@/components/admin/WorkflowStatusBar";
import { TransitionDialog } from "@/components/admin/TransitionDialog";
import { ComplianceScanPanel } from "@/components/admin/ComplianceScanPanel";
import { BilingualCompletenessCheck } from "@/components/admin/BilingualCompletenessCheck";
import { PreviewButton } from "@/components/admin/PreviewButton";

type Opportunity = {
  id: string;
  workflowState: string;
  titleEn: string;
  titleAr: string;
  publicSummaryEn: string;
  publicSummaryAr: string;
  city: string | null;
  region: string | null;
  developmentStage: string | null;
  demandDriversEn: string | null;
  demandDriversAr: string | null;
  proposedProductEn: string | null;
  proposedProductAr: string | null;
};

export function OpportunityEditor({ opportunity, previewHref }: { opportunity: Opportunity; previewHref: string }) {
  const router = useRouter();
  const [form, setForm] = useState(opportunity);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // See InsightEditor: sync only the workflow state from fresh server
  // props so a TransitionDialog message set just before router.refresh()
  // isn't wiped by a full remount.
  useEffect(() => {
    setForm((f) => ({ ...f, workflowState: opportunity.workflowState }));
  }, [opportunity.workflowState]);

  function set<K extends keyof Opportunity>(key: K, value: Opportunity[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/opportunities/${opportunity.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleEn: form.titleEn,
        titleAr: form.titleAr,
        publicSummaryEn: form.publicSummaryEn,
        publicSummaryAr: form.publicSummaryAr,
        city: form.city ?? undefined,
        region: form.region ?? undefined,
        developmentStage: form.developmentStage ?? undefined,
        demandDriversEn: form.demandDriversEn ?? undefined,
        demandDriversAr: form.demandDriversAr ?? undefined,
        proposedProductEn: form.proposedProductEn ?? undefined,
        proposedProductAr: form.proposedProductAr ?? undefined,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  const scanTextEn = `${form.titleEn}\n${form.publicSummaryEn}`;
  const scanTextAr = `${form.titleAr}\n${form.publicSummaryAr}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <WorkflowStatusBar state={form.workflowState} />
        <PreviewButton href={previewHref} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-grey-200 bg-stone-050 p-4">
          <p className="text-xs font-semibold uppercase text-grey-500">English</p>
          <input aria-label="Title (EN)" value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm font-semibold" placeholder="Title (EN)" />
          <textarea aria-label="Public summary (EN)" value={form.publicSummaryEn} onChange={(e) => set("publicSummaryEn", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={4} placeholder="Public summary (EN)" />
          <textarea aria-label="Demand drivers (EN)" value={form.demandDriversEn ?? ""} onChange={(e) => set("demandDriversEn", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} placeholder="Demand drivers (EN)" />
          <textarea aria-label="Proposed product (EN)" value={form.proposedProductEn ?? ""} onChange={(e) => set("proposedProductEn", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} placeholder="Proposed product (EN)" />
        </div>

        <div className="space-y-4 rounded-lg border border-grey-200 bg-stone-050 p-4" dir="rtl">
          <p className="text-xs font-semibold uppercase text-grey-500">العربية</p>
          <input aria-label="العنوان" value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm font-semibold" placeholder="العنوان" />
          <textarea aria-label="الملخص العام" value={form.publicSummaryAr} onChange={(e) => set("publicSummaryAr", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={4} placeholder="الملخص العام" />
          <textarea aria-label="محركات الطلب" value={form.demandDriversAr ?? ""} onChange={(e) => set("demandDriversAr", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} placeholder="محركات الطلب" />
          <textarea aria-label="المنتج المقترح" value={form.proposedProductAr ?? ""} onChange={(e) => set("proposedProductAr", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} placeholder="المنتج المقترح" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <input aria-label="City" value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} placeholder="City" className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input aria-label="Region" value={form.region ?? ""} onChange={(e) => set("region", e.target.value)} placeholder="Region" className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input aria-label="Development stage" value={form.developmentStage ?? ""} onChange={(e) => set("developmentStage", e.target.value)} placeholder="Development stage" className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
      </div>

      <div className="flex items-center gap-4">
        <BilingualCompletenessCheck textEn={scanTextEn} textAr={scanTextAr} />
        <button type="button" onClick={save} disabled={saving} className="ms-auto rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <ComplianceScanPanel textEn={scanTextEn} textAr={scanTextAr} />

      <TransitionDialog entity="opportunity" entityId={opportunity.id} state={form.workflowState} />
    </div>
  );
}
