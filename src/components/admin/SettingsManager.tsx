"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Setting = { key: string; valueJson: unknown };

function AddSettingForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("{}");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const parsedValue = JSON.parse(value || "null");
      setBusy(true);
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: parsedValue }),
      });
      setKey("");
      setValue("{}");
      router.refresh();
    } catch {
      setError("Invalid JSON value");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={add} className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <p className="text-sm font-semibold text-navy-900">Add a setting key</p>
      <p className="mt-1 text-xs text-grey-600">
        e.g. <code>home_stats_config</code> ({"{"}&quot;factIds&quot;: [&quot;...&quot;]{"}"}) or <code>home_capability_tiles</code> (an array of {"{"}key, href, mediaId{"}"}).
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[220px_1fr]">
        <input required placeholder="setting_key" value={key} onChange={(e) => setKey(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 font-mono text-xs" />
        <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={2} className="rounded-md border border-grey-200 px-3 py-2 font-mono text-xs" />
      </div>
      {error && <p className="mt-2 text-sm text-alert">{error}</p>}
      <button type="submit" disabled={busy} className="mt-2 rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 disabled:opacity-50">
        {busy ? "Adding…" : "Add"}
      </button>
    </form>
  );
}

export function SettingsManager({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, JSON.stringify(s.valueJson, null, 2)])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(key: string) {
    setBusy(key);
    setError(null);
    try {
      const value = JSON.parse(values[key] ?? "null");
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      router.refresh();
    } catch {
      setError(`Invalid JSON for ${key}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <AddSettingForm />
      {error && <p className="text-sm text-alert">{error}</p>}
      {settings.map((s) => (
        <div key={s.key} className="rounded-lg border border-grey-200 bg-stone-050 p-4">
          <label htmlFor={`setting-${s.key}`} className="block text-sm font-semibold text-navy-900">{s.key}</label>
          <textarea
            id={`setting-${s.key}`}
            value={values[s.key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
            rows={3}
            className="mt-2 w-full rounded-md border border-grey-200 px-3 py-2 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => save(s.key)}
            disabled={busy === s.key}
            className="mt-2 rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 disabled:opacity-50"
          >
            {busy === s.key ? "Saving…" : "Save"}
          </button>
        </div>
      ))}
    </div>
  );
}
