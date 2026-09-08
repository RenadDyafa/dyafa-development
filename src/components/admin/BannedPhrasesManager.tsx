"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Phrase = { id: string; phrase: string; lang: string; severity: string; active: boolean };

export function BannedPhrasesManager({ phrases }: { phrases: Phrase[] }) {
  const router = useRouter();
  const [phrase, setPhrase] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [severity, setSeverity] = useState<"block" | "flag">("block");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/admin/banned-phrases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phrase, lang, severity }),
    });
    setPhrase("");
    setBusy(false);
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/banned-phrases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this phrase?")) return;
    await fetch(`/api/admin/banned-phrases/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 rounded-lg border border-grey-200 bg-stone-050 p-4">
        <div className="flex-1">
          <label htmlFor="bp-phrase" className="block text-xs font-medium text-grey-600">Phrase</label>
          <input
            id="bp-phrase"
            required
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="mt-1 w-full rounded-md border border-grey-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="bp-lang" className="block text-xs font-medium text-grey-600">Language</label>
          <select id="bp-lang" value={lang} onChange={(e) => setLang(e.target.value as "en" | "ar")} className="mt-1 rounded-md border border-grey-200 px-2 py-2 text-sm">
            <option value="en">EN</option>
            <option value="ar">AR</option>
          </select>
        </div>
        <div>
          <label htmlFor="bp-severity" className="block text-xs font-medium text-grey-600">Severity</label>
          <select id="bp-severity" value={severity} onChange={(e) => setSeverity(e.target.value as "block" | "flag")} className="mt-1 rounded-md border border-grey-200 px-2 py-2 text-sm">
            <option value="block">Block</option>
            <option value="flag">Flag</option>
          </select>
        </div>
        <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
          Add
        </button>
      </form>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
            <th className="py-2 text-start">Phrase</th>
            <th className="py-2 text-start">Lang</th>
            <th className="py-2 text-start">Severity</th>
            <th className="py-2 text-start">Active</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {phrases.map((p) => (
            <tr key={p.id} className="border-b border-grey-100">
              <td className="py-2" dir={p.lang === "ar" ? "rtl" : "ltr"}>
                {p.phrase}
              </td>
              <td className="py-2 uppercase">{p.lang}</td>
              <td className="py-2">
                <span className={p.severity === "block" ? "text-alert" : "text-bronze"}>{p.severity}</span>
              </td>
              <td className="py-2">
                <button onClick={() => toggleActive(p.id, p.active)} type="button" className="underline">
                  {p.active ? "active" : "inactive"}
                </button>
              </td>
              <td className="py-2 text-end">
                <button onClick={() => remove(p.id)} type="button" className="text-xs font-semibold text-alert hover:underline">
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
