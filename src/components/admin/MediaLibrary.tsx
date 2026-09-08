"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Media = { id: string; path: string; altEn: string | null; kind: string; isConceptVisual: boolean };

export function MediaLibrary({ media }: { media: Media[] }) {
  const router = useRouter();
  const [altEn, setAltEn] = useState("");
  const [altAr, setAltAr] = useState("");
  const [isConceptVisual, setIsConceptVisual] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    const fileInput = document.getElementById("media-file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("altEn", altEn);
    formData.set("altAr", altAr);
    formData.set("isConceptVisual", String(isConceptVisual));

    const res = await fetch("/api/admin/media", { method: "POST", body: formData });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Upload failed");
      return;
    }
    setAltEn("");
    setAltAr("");
    if (fileInput) fileInput.value = "";
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={upload} className="space-y-3 rounded-lg border border-grey-200 bg-stone-050 p-4">
        {error && <p className="text-sm text-alert">{error}</p>}
        <label htmlFor="media-file" className="block text-sm font-medium text-navy-900">
          File
        </label>
        <input id="media-file" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" required />
        <input aria-label="Alt text (EN)" placeholder="Alt text (EN)" value={altEn} onChange={(e) => setAltEn(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input aria-label="Alt text (AR)" dir="rtl" placeholder="النص البديل" value={altAr} onChange={(e) => setAltAr(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isConceptVisual} onChange={(e) => setIsConceptVisual(e.target.checked)} />
          Concept visual (internal label — not a real project photo)
        </label>
        <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
          {busy ? "Uploading…" : "Upload"}
        </button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {media.map((m) => (
          <div key={m.id} className="rounded-lg border border-grey-200 bg-stone-050 p-3 text-xs">
            <p className="truncate font-medium text-navy-900">{m.path.replace("local:", "")}</p>
            <p className="mt-1 text-grey-500">{m.kind}</p>
            {m.isConceptVisual && <span className="mt-1 inline-block rounded-full bg-bronze/10 px-2 py-0.5 text-navy-900">concept visual</span>}
          </div>
        ))}
        {media.length === 0 && <p className="col-span-full text-sm text-grey-500">No media uploaded yet.</p>}
      </div>
    </div>
  );
}
