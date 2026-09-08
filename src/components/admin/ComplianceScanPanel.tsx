"use client";

import { useState } from "react";

type Issue = { type: string; lang: string; match: string; message: string };
type ScanResult = { blocks: Issue[]; flags: Issue[] };

export function ComplianceScanPanel({ textEn, textAr }: { textEn: string; textAr: string }) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runScan() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/compliance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_en: textEn, text_ar: textAr }),
      });
      const json = await res.json();
      setResult(json.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-900">Compliance scan</h3>
        <button
          type="button"
          onClick={runScan}
          disabled={loading}
          className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 disabled:opacity-50"
        >
          {loading ? "Scanning…" : "Run scan"}
        </button>
      </div>

      {result && (
        <div className="mt-4 space-y-3">
          {result.blocks.length === 0 && result.flags.length === 0 && (
            <p className="text-sm text-teal-600">No blocks or HIGH-RISK flags found.</p>
          )}
          {result.blocks.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-alert">Blocks ({result.blocks.length})</p>
              <ul className="mt-1 space-y-1">
                {result.blocks.map((b, i) => (
                  <li key={i} className="rounded-md bg-alert/10 px-2 py-1 text-sm text-alert">
                    {b.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.flags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-bronze">HIGH-RISK flags ({result.flags.length})</p>
              <ul className="mt-1 space-y-1">
                {result.flags.map((f, i) => (
                  <li key={i} className="rounded-md bg-bronze/10 px-2 py-1 text-sm text-navy-900">
                    {f.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
