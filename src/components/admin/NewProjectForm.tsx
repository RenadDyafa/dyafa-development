"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

export function NewProjectForm() {
  const router = useRouter();
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [stage, setStage] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [summaryAr, setSummaryAr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn, nameAr, slug: slugify(nameEn), stage, summaryEn, summaryAr }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Could not create project");
      return;
    }
    router.push(`/admin/content/projects/${json.data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-grey-200 bg-stone-050 p-4">
      {error && <p className="text-sm text-alert">{error}</p>}
      <input aria-label="Name (EN)" required placeholder="Name (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      <input aria-label="Name (AR)" required dir="rtl" placeholder="الاسم" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      <input aria-label="Stage" required placeholder="Stage (e.g. feasibility)" value={stage} onChange={(e) => setStage(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      <textarea aria-label="Summary (EN)" required placeholder="Summary (EN)" value={summaryEn} onChange={(e) => setSummaryEn(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} />
      <textarea aria-label="Summary (AR)" required dir="rtl" placeholder="الملخص" value={summaryAr} onChange={(e) => setSummaryAr(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} />
      <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
        {busy ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
