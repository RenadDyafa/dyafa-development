"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WorkflowStatusBar } from "@/components/admin/WorkflowStatusBar";
import { TransitionDialog } from "@/components/admin/TransitionDialog";
import { ComplianceScanPanel } from "@/components/admin/ComplianceScanPanel";
import { BilingualCompletenessCheck } from "@/components/admin/BilingualCompletenessCheck";
import { PreviewButton } from "@/components/admin/PreviewButton";

type Pillar = { id: string; nameEn: string };

type Insight = {
  id: string;
  status: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  bodyEn: string;
  bodyAr: string;
  slugEn: string;
  pillarId: string;
};

export function InsightEditor({ insight, pillars, previewHref }: { insight: Insight; pillars: Pillar[]; previewHref: string }) {
  const router = useRouter();
  const [form, setForm] = useState(insight);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync only the workflow state from fresh server props (after a
  // transition's router.refresh()) — without remounting the tree, which
  // would wipe TransitionDialog's own just-set success/error message before
  // it's ever seen.
  useEffect(() => {
    setForm((f) => ({ ...f, status: insight.status }));
  }, [insight.status]);

  function set<K extends keyof Insight>(key: K, value: Insight[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/insights/${insight.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleEn: form.titleEn,
        titleAr: form.titleAr,
        excerptEn: form.excerptEn,
        excerptAr: form.excerptAr,
        bodyEn: form.bodyEn,
        bodyAr: form.bodyAr,
        pillarId: form.pillarId,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <WorkflowStatusBar state={form.status} />
        <PreviewButton href={previewHref} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-grey-200 bg-stone-050 p-4">
          <p className="text-xs font-semibold uppercase text-grey-500">English</p>
          <input
            aria-label="Title (EN)"
            value={form.titleEn}
            onChange={(e) => set("titleEn", e.target.value)}
            className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm font-semibold"
            placeholder="Title (EN)"
          />
          <textarea
            aria-label="Excerpt (EN)"
            value={form.excerptEn}
            onChange={(e) => set("excerptEn", e.target.value)}
            className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm"
            rows={2}
            placeholder="Excerpt (EN)"
          />
          <textarea
            aria-label="Body (EN)"
            value={form.bodyEn}
            onChange={(e) => set("bodyEn", e.target.value)}
            className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm"
            rows={10}
            placeholder="Body (EN)"
          />
        </div>

        <div className="space-y-4 rounded-lg border border-grey-200 bg-stone-050 p-4" dir="rtl">
          <p className="text-xs font-semibold uppercase text-grey-500">العربية</p>
          <input
            aria-label="العنوان"
            value={form.titleAr}
            onChange={(e) => set("titleAr", e.target.value)}
            className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm font-semibold"
            placeholder="العنوان"
          />
          <textarea
            aria-label="المقتطف"
            value={form.excerptAr}
            onChange={(e) => set("excerptAr", e.target.value)}
            className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm"
            rows={2}
            placeholder="المقتطف"
          />
          <textarea
            aria-label="النص"
            value={form.bodyAr}
            onChange={(e) => set("bodyAr", e.target.value)}
            className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm"
            rows={10}
            placeholder="النص"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-navy-900">
          Pillar:
          <select value={form.pillarId} onChange={(e) => set("pillarId", e.target.value)} className="ms-2 rounded-md border border-grey-200 px-2 py-1.5 text-sm">
            {pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameEn}
              </option>
            ))}
          </select>
        </label>
        <BilingualCompletenessCheck textEn={`${form.titleEn}\n${form.bodyEn}`} textAr={`${form.titleAr}\n${form.bodyAr}`} />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="ms-auto rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <ComplianceScanPanel textEn={`${form.titleEn}\n${form.bodyEn}`} textAr={`${form.titleAr}\n${form.bodyAr}`} />

      <TransitionDialog entity="insight" entityId={insight.id} state={form.status} />
    </div>
  );
}
