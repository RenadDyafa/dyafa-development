"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

export function NewCampaignForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [headlineEn, setHeadlineEn] = useState("");
  const [headlineAr, setHeadlineAr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slugify(name), name, headlineEn, headlineAr }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Could not create campaign");
      return;
    }
    router.push(`/admin/content/campaigns/${json.data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-grey-200 bg-stone-050 p-4">
      {error && <p className="text-sm text-alert">{error}</p>}
      <input aria-label="Internal name" required placeholder="Internal name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      <input aria-label="Headline (EN)" required placeholder="Headline (EN)" value={headlineEn} onChange={(e) => setHeadlineEn(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      <input aria-label="Headline (AR)" required dir="rtl" placeholder="العنوان الرئيسي" value={headlineAr} onChange={(e) => setHeadlineAr(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
      <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
        {busy ? "Creating…" : "Create draft"}
      </button>
    </form>
  );
}
