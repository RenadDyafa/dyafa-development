"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SliderSettings } from "@/lib/settings/sliders";

type Testimonial = {
  id: string;
  displayOrder: number;
  active: boolean;
  quoteEn: string;
  quoteAr: string;
  authorName: string;
  authorRoleEn: string | null;
  authorRoleAr: string | null;
  authorCompany: string | null;
  avatarMedia: { path: string } | null;
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
      body: JSON.stringify({ key: "testimonial_slider_settings", value: form }),
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

function NewTestimonialForm() {
  const router = useRouter();
  const [quoteEn, setQuoteEn] = useState("");
  const [quoteAr, setQuoteAr] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRoleEn, setAuthorRoleEn] = useState("");
  const [authorCompany, setAuthorCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteEn,
          quoteAr,
          authorName,
          authorRoleEn: authorRoleEn || undefined,
          authorCompany: authorCompany || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Could not add testimonial");

      setQuoteEn("");
      setQuoteAr("");
      setAuthorName("");
      setAuthorRoleEn("");
      setAuthorCompany("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add testimonial");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <p className="text-sm font-semibold text-navy-900">Add testimonial</p>
      <p className="mt-1 text-xs text-grey-600">Only ever add a quote that was actually given, attributed to a real person.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <textarea required placeholder="Quote (EN)" value={quoteEn} onChange={(e) => setQuoteEn(e.target.value)} rows={3} className="rounded-md border border-grey-200 px-3 py-2 text-sm sm:col-span-2" />
        <textarea required dir="rtl" placeholder="الاقتباس" value={quoteAr} onChange={(e) => setQuoteAr(e.target.value)} rows={3} className="rounded-md border border-grey-200 px-3 py-2 text-sm sm:col-span-2" />
        <input required placeholder="Author name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input placeholder="Role (optional)" value={authorRoleEn} onChange={(e) => setAuthorRoleEn(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input placeholder="Company (optional)" value={authorCompany} onChange={(e) => setAuthorCompany(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm sm:col-span-2" />
      </div>
      {error && <p className="mt-2 text-sm text-alert">{error}</p>}
      <button type="submit" disabled={busy} className="mt-3 rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
        {busy ? "Adding…" : "Add"}
      </button>
    </form>
  );
}

function TestimonialRow({
  testimonial,
  isFirst,
  isLast,
  onMove,
}: {
  testimonial: Testimonial;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(testimonial);
  const [busy, setBusy] = useState(false);
  const avatarUrl = testimonial.avatarMedia ? mediaPreviewUrl(testimonial.avatarMedia.path) : null;

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/testimonials/${testimonial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    router.refresh();
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("altEn", `${testimonial.authorName} avatar`);
    const uploadRes = await fetch("/api/admin/media", { method: "POST", body: formData });
    const uploadJson = await uploadRes.json();
    if (uploadRes.ok) await patch({ avatarMediaId: uploadJson.data.id });
    else setBusy(false);
  }

  async function saveEdits() {
    await patch({
      quoteEn: form.quoteEn,
      quoteAr: form.quoteAr,
      authorName: form.authorName,
      authorRoleEn: form.authorRoleEn ?? "",
      authorRoleAr: form.authorRoleAr ?? "",
      authorCompany: form.authorCompany ?? "",
    });
    setEditing(false);
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/admin/testimonials/${testimonial.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-050">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-grey-500">{testimonial.authorName.slice(0, 1)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy-900">{testimonial.authorName}</p>
          <p className="truncate text-xs text-grey-500">{testimonial.quoteEn}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label className="cursor-pointer text-xs font-semibold text-teal-600 hover:underline">
            Avatar
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onAvatarChange} disabled={busy} className="hidden" />
          </label>
          <button type="button" onClick={() => onMove(-1)} disabled={busy || isFirst} className="rounded-md border border-grey-200 px-2 py-1 text-xs disabled:opacity-30" aria-label="Move up">
            ↑
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={busy || isLast} className="rounded-md border border-grey-200 px-2 py-1 text-xs disabled:opacity-30" aria-label="Move down">
            ↓
          </button>
          <button
            type="button"
            onClick={() => patch({ active: !testimonial.active })}
            disabled={busy}
            className={testimonial.active ? "rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050" : "rounded-md border border-grey-200 px-3 py-1.5 text-xs font-semibold text-grey-600"}
          >
            {testimonial.active ? "Published" : "Draft"}
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
          <textarea placeholder="Quote (EN)" value={form.quoteEn} onChange={(e) => setForm((f) => ({ ...f, quoteEn: e.target.value }))} rows={3} className="rounded-md border border-grey-200 px-3 py-2 text-sm sm:col-span-2" />
          <textarea dir="rtl" placeholder="الاقتباس" value={form.quoteAr} onChange={(e) => setForm((f) => ({ ...f, quoteAr: e.target.value }))} rows={3} className="rounded-md border border-grey-200 px-3 py-2 text-sm sm:col-span-2" />
          <input placeholder="Author name" value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
          <input placeholder="Role (EN)" value={form.authorRoleEn ?? ""} onChange={(e) => setForm((f) => ({ ...f, authorRoleEn: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
          <input placeholder="Company" value={form.authorCompany ?? ""} onChange={(e) => setForm((f) => ({ ...f, authorCompany: e.target.value }))} className="rounded-md border border-grey-200 px-3 py-2 text-sm sm:col-span-2" />
          <button type="button" onClick={saveEdits} disabled={busy} className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 sm:w-fit">
            Save
          </button>
        </div>
      )}
    </div>
  );
}

export function TestimonialsManager({ testimonials, settings }: { testimonials: Testimonial[]; settings: SliderSettings }) {
  const router = useRouter();

  async function move(index: number, direction: -1 | 1) {
    const other = testimonials[index + direction];
    const current = testimonials[index];
    if (!other || !current) return;

    await Promise.all([
      fetch(`/api/admin/testimonials/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: other.displayOrder }),
      }),
      fetch(`/api/admin/testimonials/${other.id}`, {
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
      <NewTestimonialForm />
      {testimonials.length === 0 && <p className="text-sm text-grey-500">No testimonials yet - the homepage section stays hidden.</p>}
      {testimonials.map((t, i) => (
        <TestimonialRow key={t.id} testimonial={t} isFirst={i === 0} isLast={i === testimonials.length - 1} onMove={(direction) => move(i, direction)} />
      ))}
    </div>
  );
}
