"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowStatusBar } from "@/components/admin/WorkflowStatusBar";
import { TransitionDialog } from "@/components/admin/TransitionDialog";
import { ComplianceScanPanel } from "@/components/admin/ComplianceScanPanel";
import { BilingualCompletenessCheck } from "@/components/admin/BilingualCompletenessCheck";

type Campaign = { id: string; status: string; name: string; slug: string; headlineEn: string; headlineAr: string };

export function CampaignEditor({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [form, setForm] = useState(campaign);
  const [saving, setSaving] = useState(false);

  // Sync only the workflow state from fresh server props — see InsightEditor
  // for why this must not remount the tree (would wipe TransitionDialog's
  // just-set success/error message).
  useEffect(() => {
    setForm((f) => ({ ...f, status: campaign.status }));
  }, [campaign.status]);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, headlineEn: form.headlineEn, headlineAr: form.headlineAr }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <WorkflowStatusBar state={form.status} />
      <p className="text-sm text-grey-600">Live URL (once published): /campaigns/{campaign.slug}</p>

      <div className="space-y-3 rounded-lg border border-grey-200 bg-stone-050 p-4">
        <input aria-label="Internal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm font-semibold" placeholder="Internal name" />
        <input aria-label="Headline (EN)" value={form.headlineEn} onChange={(e) => setForm({ ...form, headlineEn: e.target.value })} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" placeholder="Headline (EN)" />
        <input aria-label="Headline (AR)" dir="rtl" value={form.headlineAr} onChange={(e) => setForm({ ...form, headlineAr: e.target.value })} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" placeholder="العنوان" />
      </div>

      <div className="flex items-center gap-4">
        <BilingualCompletenessCheck textEn={form.headlineEn} textAr={form.headlineAr} />
        <button type="button" onClick={save} disabled={saving} className="ms-auto rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <ComplianceScanPanel textEn={form.headlineEn} textAr={form.headlineAr} />
      <TransitionDialog entity="campaign" entityId={campaign.id} state={form.status} />
    </div>
  );
}
