"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectImage = {
  id: string;
  displayOrder: number;
  isCover: boolean;
  captionEn: string | null;
  captionAr: string | null;
  media: { id: string; path: string; kind: string };
};

function mediaPreviewUrl(path: string) {
  const match = /^local:media\/(.+)$/.exec(path);
  return match ? `/api/media/${match[1]}` : null;
}

function AddImageForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("altEn", "Project photo");
      formData.set("altAr", "صورة المشروع");

      const uploadRes = await fetch("/api/admin/media", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error?.message ?? "Upload failed");

      const createRes = await fetch(`/api/admin/projects/${projectId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: uploadJson.data.id }),
      });
      if (!createRes.ok) {
        const createJson = await createRes.json();
        throw new Error(createJson.error?.message ?? "Could not add image");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add image");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <p className="text-sm font-semibold text-navy-900">Add photo</p>
      <label className="mt-3 inline-block w-fit cursor-pointer rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 hover:bg-navy-800">
        {busy ? "Uploading…" : "Choose file & add"}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} disabled={busy} className="hidden" />
      </label>
      {error && <p className="mt-2 text-sm text-alert">{error}</p>}
    </div>
  );
}

function ImageRow({
  image,
  isFirst,
  isLast,
  onMove,
}: {
  image: ProjectImage;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const preview = mediaPreviewUrl(image.media.path);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/project-images/${image.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/admin/project-images/${image.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-grey-200 bg-stone-050 p-3">
      <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-stone-050">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-grey-500">No preview</span>
        )}
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
          onClick={() => patch({ isCover: true })}
          disabled={busy || image.isCover}
          className={image.isCover ? "rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050" : "rounded-md border border-grey-200 px-3 py-1.5 text-xs font-semibold text-grey-600"}
        >
          {image.isCover ? "Cover" : "Set as cover"}
        </button>
        <button type="button" onClick={remove} disabled={busy} className="text-xs font-semibold text-alert hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}

export function ProjectImagesManager({ projectId, images }: { projectId: string; images: ProjectImage[] }) {
  const router = useRouter();

  // Same integer-swap reorder as HomeSlidesManager - displayOrder is a plain
  // Int column, so two PATCH calls rather than a fractional value.
  async function move(index: number, direction: -1 | 1) {
    const other = images[index + direction];
    const current = images[index];
    if (!other || !current) return;

    await Promise.all([
      fetch(`/api/admin/project-images/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: other.displayOrder }),
      }),
      fetch(`/api/admin/project-images/${other.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: current.displayOrder }),
      }),
    ]);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-navy-900">Gallery</p>
      <AddImageForm projectId={projectId} />
      {images.length === 0 && <p className="text-sm text-grey-500">No photos yet.</p>}
      {images.map((image, i) => (
        <ImageRow key={image.id} image={image} isFirst={i === 0} isLast={i === images.length - 1} onMove={(direction) => move(i, direction)} />
      ))}
    </div>
  );
}
