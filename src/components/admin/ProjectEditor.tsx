"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowStatusBar } from "@/components/admin/WorkflowStatusBar";
import { TransitionDialog } from "@/components/admin/TransitionDialog";
import { ComplianceScanPanel } from "@/components/admin/ComplianceScanPanel";
import { BilingualCompletenessCheck } from "@/components/admin/BilingualCompletenessCheck";
import { ProjectImagesManager } from "@/components/admin/ProjectImagesManager";

type ProjectImage = {
  id: string;
  displayOrder: number;
  isCover: boolean;
  captionEn: string | null;
  captionAr: string | null;
  media: { id: string; path: string; kind: string };
};

type Project = {
  id: string;
  status: string;
  nameEn: string;
  nameAr: string;
  stage: string;
  city: string | null;
  summaryEn: string;
  summaryAr: string;
};

export function ProjectEditor({ project, images }: { project: Project; images: ProjectImage[] }) {
  const router = useRouter();
  const [form, setForm] = useState(project);
  const [saving, setSaving] = useState(false);

  // Sync only the workflow state from fresh server props — see InsightEditor
  // for why this must not remount the tree (would wipe TransitionDialog's
  // just-set success/error message).
  useEffect(() => {
    setForm((f) => ({ ...f, status: project.status }));
  }, [project.status]);

  function set<K extends keyof Project>(key: K, value: Project[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn: form.nameEn, nameAr: form.nameAr, stage: form.stage, city: form.city, summaryEn: form.summaryEn, summaryAr: form.summaryAr }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <WorkflowStatusBar state={form.status} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-grey-200 bg-stone-050 p-4">
          <p className="text-xs font-semibold uppercase text-grey-500">English</p>
          <input aria-label="Name (EN)" value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm font-semibold" />
          <textarea aria-label="Summary (EN)" value={form.summaryEn} onChange={(e) => set("summaryEn", e.target.value)} rows={4} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-3 rounded-lg border border-grey-200 bg-stone-050 p-4" dir="rtl">
          <p className="text-xs font-semibold uppercase text-grey-500">العربية</p>
          <input aria-label="الاسم" value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm font-semibold" />
          <textarea aria-label="الملخص" value={form.summaryAr} onChange={(e) => set("summaryAr", e.target.value)} rows={4} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input aria-label="Stage" value={form.stage} onChange={(e) => set("stage", e.target.value)} placeholder="Stage" className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input aria-label="City" value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} placeholder="City" className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <BilingualCompletenessCheck textEn={`${form.nameEn}\n${form.summaryEn}`} textAr={`${form.nameAr}\n${form.summaryAr}`} />
        <button type="button" onClick={save} disabled={saving} className="ms-auto rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <ComplianceScanPanel textEn={`${form.nameEn}\n${form.summaryEn}`} textAr={`${form.nameAr}\n${form.summaryAr}`} />
      <ProjectImagesManager projectId={project.id} images={images} />
      <TransitionDialog entity="project" entityId={project.id} state={form.status} />
    </div>
  );
}
