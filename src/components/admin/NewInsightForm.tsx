"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// slugify() on a non-Latin (e.g. Arabic) title strips every letter, leaving
// only "-" separators — a truthy-but-meaningless string that would collide
// with every other non-Latin title's slug. Require at least one real
// alphanumeric character before trusting the result.
function hasSlugContent(value: string) {
  return /[a-z0-9]/.test(value);
}

export function NewInsightForm({ pillars }: { pillars: Array<{ id: string; nameEn: string }> }) {
  const router = useRouter();
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [pillarId, setPillarId] = useState(pillars[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const slugEn = slugify(titleEn);
    const slugArCandidate = slugify(titleAr);
    const res = await fetch("/api/admin/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleEn,
        titleAr,
        slugEn,
        slugAr: hasSlugContent(slugArCandidate) ? slugArCandidate : slugEn,
        excerptEn: titleEn,
        excerptAr: titleAr,
        bodyEn: "",
        bodyAr: "",
        pillarId,
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Could not create insight");
      return;
    }
    router.push(`/admin/content/insights/${json.data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-alert">{error}</p>}
      <div>
        <label htmlFor="new-insight-title-en" className="block text-sm font-medium text-navy-900">Title (EN)</label>
        <input id="new-insight-title-en" required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="mt-1 w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="new-insight-title-ar" className="block text-sm font-medium text-navy-900">Title (AR)</label>
        <input id="new-insight-title-ar" required dir="rtl" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className="mt-1 w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="new-insight-pillar" className="block text-sm font-medium text-navy-900">Pillar</label>
        <select id="new-insight-pillar" value={pillarId} onChange={(e) => setPillarId(e.target.value)} className="mt-1 w-full rounded-md border border-grey-200 px-3 py-2 text-sm">
          {pillars.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nameEn}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
        {busy ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
