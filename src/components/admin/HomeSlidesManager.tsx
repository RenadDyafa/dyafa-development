"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SliderSettings } from "@/lib/settings/sliders";

type Slide = {
  id: string;
  displayOrder: number;
  active: boolean;
  headlineEn: string | null;
  headlineAr: string | null;
  subheadlineEn: string | null;
  subheadlineAr: string | null;
  ctaLabelEn: string | null;
  ctaLabelAr: string | null;
  ctaHref: string | null;
  media: { id: string; path: string; kind: string };
};

function mediaPreviewUrl(path: string) {
  const match = /^local:media\/(.+)$/.exec(path);
  return match ? `/api/media/${match[1]}` : null;
}

function SliderSettingsForm({ settings }: { settings: SliderSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "home_slider_settings", value: form }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not save (requires admin role)");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <p className="text-sm font-semibold text-navy-900">Slider settings</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-navy-900">
          Autoplay (seconds, 0 = off)
          <input
            type="number"
            min={0}
            max={60}
            value={form.autoplayMs / 1000}
            onChange={(e) => setForm((f) => ({ ...f, autoplayMs: Math.max(0, Number(e.target.value)) * 1000 }))}
            className="w-20 rounded-md border border-grey-200 px-2 py-1 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input type="checkbox" checked={form.showArrows} onChange={(e) => setForm((f) => ({ ...f, showArrows: e.target.checked }))} />
          Arrows
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input type="checkbox" checked={form.showBullets} onChange={(e) => setForm((f) => ({ ...f, showBullets: e.target.checked }))} />
          Bullets
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-900">
          <input type="checkbox" checked={form.loop} onChange={(e) => setForm((f) => ({ ...f, loop: e.target.checked }))} />
          Loop
        </label>
        <button type="button" onClick={save} disabled={busy} className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 disabled:opacity-50">
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-alert">{error}</p>}
    </div>
  );
}

function NewSlideForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headlineEn, setHeadlineEn] = useState("");
  const [headlineAr, setHeadlineAr] = useState("");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("altEn", headlineEn || "Home slider slide");
      formData.set("altAr", headlineAr || "شريحة السلايدر الرئيسي");

      const uploadRes = await fetch("/api/admin/media", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error?.message ?? "Upload failed");

      const createRes = await fetch("/api/admin/home-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: uploadJson.data.id, headlineEn: headlineEn || undefined, headlineAr: headlineAr || undefined }),
      });
      if (!createRes.ok) {
        const createJson = await createRes.json();
        throw new Error(createJson.error?.message ?? "Could not create slide");
      }

      setHeadlineEn("");
      setHeadlineAr("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add slide");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <p className="text-sm font-semibold text-navy-900">Add slide</p>
      <p className="mt-1 text-xs text-grey-600">Upload an image (JPEG/PNG/WebP) or video (MP4/WebM). Optional overlay headline.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input placeholder="Headline (EN, optional)" value={headlineEn} onChange={(e) => setHeadlineEn(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input placeholder="العنوان (اختياري)" dir="rtl" value={headlineAr} onChange={(e) => setHeadlineAr(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
      </div>
      <label className="mt-3 inline-block w-fit cursor-pointer rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 hover:bg-navy-800">
        {busy ? "Uploading…" : "Choose file & add"}
        <input type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" onChange={onFileChange} disabled={busy} className="hidden" />
      </label>
      {error && <p className="mt-2 text-sm text-alert">{error}</p>}
    </div>
  );
}

function SlideRow({
  slide,
  isFirst,
  isLast,
  onMove,
}: {
  slide: Slide;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(slide);
  const [busy, setBusy] = useState(false);
  const preview = mediaPreviewUrl(slide.media.path);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/home-slides/${slide.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    router.refresh();
  }

  async function saveEdits() {
    await patch({
      headlineEn: form.headlineEn ?? "",
      headlineAr: form.headlineAr ?? "",
      subheadlineEn: form.subheadlineEn ?? "",
      subheadlineAr: form.subheadlineAr ?? "",
      ctaLabelEn: form.ctaLabelEn ?? "",
      ctaLabelAr: form.ctaLabelAr ?? "",
      ctaHref: form.ctaHref ?? "",
    });
    setEditing(false);
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/admin/home-slides/${slide.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md bg-stone-050">
          {preview && slide.media.kind === "video" ? (
            <video src={preview} className="h-full w-full object-cover" muted />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-grey-500">No preview</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy-900">{slide.headlineEn || "(no headline)"}</p>
          <p className="text-xs text-grey-500">{slide.media.kind}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => onMove(-1)} disabled={busy || isFirst} className="rounded-md border border-grey-200 px-2 py-1 text-xs disabled:opacity-30" aria-label="Move up">
            ↑
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={busy || isLast} className="rounded-md border border-grey-200 px-2 py-1 text-xs disabled:opacity-30" aria-label="Move down">
            ↓
          </button>
          <button
            type="button"
            onClick={() => patch({ active: !slide.active })}
            disabled={busy}
            className={slide.active ? "rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050" : "rounded-md border border-grey-200 px-3 py-1.5 text-xs font-semibold text-grey-600"}
          >
            {slide.active ? "Published" : "Draft"}
          </button>
          <button type="button" onClick={() => setEditing((v) => !v)} className="rounded-md border border-grey-200 px-3 py-1.5 text-xs font-semibold text-navy-900">
            {editing ? "Close" : "Edit"}
          </button>
          <button type="button" onClick={remove} disabled={busy} className="text-xs font-semibold text-alert hover:underline">
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-4 grid gap-3 border-t border-grey-100 pt-4 sm:grid-cols-2">
          <input placeholder="Headline (EN)" value={form.headlineEn ?? ""} onChange={(e) => setForm((f) => ({ ...f, headlineEn: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
          <input placeholder="العنوان" dir="rtl" value={form.headlineAr ?? ""} onChange={(e) => setForm((f) => ({ ...f, headlineAr: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
          <input placeholder="Subheadline (EN)" value={form.subheadlineEn ?? ""} onChange={(e) => setForm((f) => ({ ...f, subheadlineEn: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
          <input placeholder="العنوان الفرعي" dir="rtl" value={form.subheadlineAr ?? ""} onChange={(e) => setForm((f) => ({ ...f, subheadlineAr: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
          <input placeholder="CTA label (EN)" value={form.ctaLabelEn ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaLabelEn: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
          <input placeholder="نص الزر" dir="rtl" value={form.ctaLabelAr ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaLabelAr: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
          <input placeholder="CTA link (e.g. /submit-your-site)" value={form.ctaHref ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm sm:col-span-2" />
          <button type="button" onClick={saveEdits} disabled={busy} className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 sm:w-fit">
            Save
          </button>
        </div>
      )}
    </div>
  );
}

export function HomeSlidesManager({ slides, settings }: { slides: Slide[]; settings: SliderSettings }) {
  const router = useRouter();

  // Swaps this row's displayOrder with its immediate neighbor's - two PATCH
  // calls rather than a fractional order value, since displayOrder is a
  // plain Int column (a fractional "in-between" value would round/truncate
  // unpredictably rather than actually reorder).
  async function move(index: number, direction: -1 | 1) {
    const other = slides[index + direction];
    const current = slides[index];
    if (!other || !current) return;

    await Promise.all([
      fetch(`/api/admin/home-slides/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: other.displayOrder }),
      }),
      fetch(`/api/admin/home-slides/${other.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: current.displayOrder }),
      }),
    ]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SliderSettingsForm settings={settings} />
      <NewSlideForm />
      {slides.length === 0 && <p className="text-sm text-grey-500">No slides yet - the homepage hero falls back to its default look.</p>}
      {slides.map((slide, i) => (
        <SlideRow key={slide.id} slide={slide} isFirst={i === 0} isLast={i === slides.length - 1} onMove={(direction) => move(i, direction)} />
      ))}
    </div>
  );
}
