"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["news", "milestone", "partnership", "event"] as const;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
}

function hasSlugContent(value: string) {
  return /[a-z0-9]/.test(value);
}

export function NewNewsForm() {
  const router = useRouter();
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("news");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const slugEn = slugify(titleEn);
    const slugArCandidate = slugify(titleAr);
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleEn,
        titleAr,
        slugEn,
        slugAr: hasSlugContent(slugArCandidate) ? slugArCandidate : slugEn,
        type,
        excerptEn: titleEn,
        excerptAr: titleAr,
        bodyEn: "",
        bodyAr: "",
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Could not create news item");
      return;
    }
    router.push(`/admin/content/news/${json.data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-alert">{error}</p>}
      <div>
        <label htmlFor="new-news-title-en" className="block text-sm font-medium text-navy-900">Title (EN)</label>
        <input id="new-news-title-en" required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="mt-1 w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="new-news-title-ar" className="block text-sm font-medium text-navy-900">Title (AR)</label>
        <input id="new-news-title-ar" required dir="rtl" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className="mt-1 w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="new-news-type" className="block text-sm font-medium text-navy-900">Type</label>
        <select id="new-news-type" value={type} onChange={(e) => setType(e.target.value as typeof type)} className="mt-1 w-full rounded-md border border-grey-200 px-3 py-2 text-sm">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
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
