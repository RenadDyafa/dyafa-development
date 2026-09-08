"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CurrentLogo = { mediaId: string; url: string } | null;

function LogoUploadField({
  settingKey,
  label,
  hint,
  previewClassName,
  currentLogo,
}: {
  settingKey: string;
  label: string;
  hint: string;
  previewClassName: string;
  currentLogo: CurrentLogo;
}) {
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
      formData.set("altEn", `Dyafa Development logo (${label})`);
      formData.set("altAr", "شعار ضيافة للتطوير");

      const uploadRes = await fetch("/api/admin/media", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error?.message ?? "Upload failed");

      const settingRes = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: settingKey,
          value: { mediaId: uploadJson.data.id, path: uploadJson.data.path },
        }),
      });
      if (!settingRes.ok) {
        const settingJson = await settingRes.json();
        throw new Error(settingJson.error?.message ?? "Could not save the logo setting");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the logo");
    } finally {
      setBusy(false);
    }
  }

  async function removeLogo() {
    setBusy(true);
    setError(null);
    try {
      // {} rather than null - Prisma's Json (non-nullable) field handling of
      // a literal JS null is ambiguous between "JSON null" and "no-op"; an
      // empty object is unambiguous and fails the value-shape validation
      // the same way, reverting to the fallback (legacy logo, then text).
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: settingKey, value: {} }),
      });
      if (!res.ok) throw new Error("Could not remove the logo");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the logo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <p className="text-sm font-semibold text-navy-900">{label}</p>
      <p className="mt-1 text-xs text-grey-600">{hint}</p>

      <div className="mt-4 flex items-center gap-4">
        <div className={previewClassName}>
          {currentLogo ? (
            // eslint-disable-next-line @next/next/no-img-element -- served by our own /api/media route, not an optimizable remote image
            <img src={currentLogo.url} alt={`Current ${label}`} className="max-h-14 max-w-36 object-contain" />
          ) : (
            <span className="text-xs text-grey-500">No logo set</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="w-fit cursor-pointer rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 hover:bg-navy-800">
            {busy ? "Uploading…" : currentLogo ? "Replace" : "Upload"}
            <input
              type="file"
              aria-label={`${label} file`}
              accept="image/png,image/jpeg,image/webp"
              onChange={onFileChange}
              disabled={busy}
              className="hidden"
            />
          </label>
          {currentLogo && (
            <button
              type="button"
              aria-label={`Remove ${label}`}
              onClick={removeLogo}
              disabled={busy}
              className="text-start text-xs font-semibold text-alert hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-alert">{error}</p>}
    </div>
  );
}

export function LogoSettingManager({
  headerLogo,
  footerLogo,
}: {
  headerLogo: CurrentLogo;
  footerLogo: CurrentLogo;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-navy-900">Site logo</p>
      <p className="mt-1 text-xs text-grey-600">
        Upload a separate variant for each placement if one logo doesn&apos;t read well on both backgrounds (e.g. dark
        wordmark text disappearing on the dark footer). If only one is set, it&apos;s used for both.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <LogoUploadField
          settingKey="site_logo_header"
          label="Header logo"
          hint="Shown in the sticky header, on a dark background. PNG, JPEG, or WebP."
          previewClassName="flex h-16 w-40 items-center justify-center rounded-md border border-dashed border-grey-400 bg-navy-900"
          currentLogo={headerLogo}
        />
        <LogoUploadField
          settingKey="site_logo_footer"
          label="Footer logo"
          hint="Shown in the footer, on a dark background. PNG, JPEG, or WebP."
          previewClassName="flex h-16 w-40 items-center justify-center rounded-md border border-dashed border-grey-400 bg-navy-900"
          currentLogo={footerLogo}
        />
      </div>
    </div>
  );
}
