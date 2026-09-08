"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WorkflowStatusBar } from "@/components/admin/WorkflowStatusBar";
import { TransitionDialog } from "@/components/admin/TransitionDialog";
import { ComplianceScanPanel } from "@/components/admin/ComplianceScanPanel";
import { BilingualCompletenessCheck } from "@/components/admin/BilingualCompletenessCheck";
import { PreviewButton } from "@/components/admin/PreviewButton";

type NewsItem = {
  id: string;
  workflowState: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  bodyEn: string;
  bodyAr: string;
};

export function NewsEditor({ newsItem, previewHref }: { newsItem: NewsItem; previewHref: string }) {
  const router = useRouter();
  const [form, setForm] = useState(newsItem);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, workflowState: newsItem.workflowState }));
  }, [newsItem.workflowState]);

  function set<K extends keyof NewsItem>(key: K, value: NewsItem[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/news/${newsItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleEn: form.titleEn,
        titleAr: form.titleAr,
        excerptEn: form.excerptEn,
        excerptAr: form.excerptAr,
        bodyEn: form.bodyEn,
        bodyAr: form.bodyAr,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  const scanTextEn = `${form.titleEn}\n${form.bodyEn}`;
  const scanTextAr = `${form.titleAr}\n${form.bodyAr}`;

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
          <textarea aria-label="Excerpt (EN)" value={form.excerptEn} onChange={(e) => set("excerptEn", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} placeholder="Excerpt (EN)" />
          <textarea aria-label="Body (EN)" value={form.bodyEn} onChange={(e) => set("bodyEn", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={10} placeholder="Body (EN)" />
        </div>

        <div className="space-y-4 rounded-lg border border-grey-200 bg-stone-050 p-4" dir="rtl">
          <p className="text-xs font-semibold uppercase text-grey-500">العربية</p>
          <input aria-label="العنوان" value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm font-semibold" placeholder="العنوان" />
          <textarea aria-label="المقتطف" value={form.excerptAr} onChange={(e) => set("excerptAr", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} placeholder="المقتطف" />
          <textarea aria-label="النص" value={form.bodyAr} onChange={(e) => set("bodyAr", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={10} placeholder="النص" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <BilingualCompletenessCheck textEn={scanTextEn} textAr={scanTextAr} />
        <button type="button" onClick={save} disabled={saving} className="ms-auto rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <ComplianceScanPanel textEn={scanTextEn} textAr={scanTextAr} />

      <TransitionDialog entity="news" entityId={newsItem.id} state={form.workflowState} />
    </div>
  );
}
