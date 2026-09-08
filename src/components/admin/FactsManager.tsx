"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fact = {
  id: string;
  statementEn: string;
  statementAr: string;
  approvedAt: string | null;
  value: number | null;
  prefix: string | null;
  suffix: string | null;
};

export function FactsManager({ facts }: { facts: Fact[] }) {
  const router = useRouter();
  const [statementEn, setStatementEn] = useState("");
  const [statementAr, setStatementAr] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/admin/facts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statementEn, statementAr }),
    });
    setStatementEn("");
    setStatementAr("");
    setBusy(false);
    router.refresh();
  }

  async function toggleApprove(id: string, approved: boolean) {
    await fetch(`/api/admin/facts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve: !approved }),
    });
    router.refresh();
  }

  async function saveStatFields(id: string, fields: { value: number | null; prefix: string | null; suffix: string | null }) {
    await fetch(`/api/admin/facts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="space-y-3 rounded-lg border border-grey-200 bg-stone-050 p-4">
        <textarea aria-label="Statement (EN)" required placeholder="Statement (EN)" value={statementEn} onChange={(e) => setStatementEn(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} />
        <textarea aria-label="Statement (AR)" required dir="rtl" placeholder="البيان" value={statementAr} onChange={(e) => setStatementAr(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" rows={2} />
        <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
          Add
        </button>
      </form>

      <p className="mt-6 text-xs text-grey-600">
        A fact only appears in the homepage stat strip once it is <strong>Approved</strong> and has a numeric <strong>value</strong> filled in below (feature it via
        the <code>home_stats_config</code> setting under Settings). Prefix/suffix are optional (e.g. suffix &quot;+&quot;).
      </p>

      <ul className="mt-3 space-y-2">
        {facts.map((f) => (
          <FactRow key={f.id} fact={f} onToggleApprove={toggleApprove} onSaveStatFields={saveStatFields} />
        ))}
        {facts.length === 0 && <p className="text-sm text-grey-500">No approved facts yet.</p>}
      </ul>
    </div>
  );
}

function FactRow({
  fact,
  onToggleApprove,
  onSaveStatFields,
}: {
  fact: Fact;
  onToggleApprove: (id: string, approved: boolean) => void;
  onSaveStatFields: (id: string, fields: { value: number | null; prefix: string | null; suffix: string | null }) => void;
}) {
  const [value, setValue] = useState(fact.value?.toString() ?? "");
  const [prefix, setPrefix] = useState(fact.prefix ?? "");
  const [suffix, setSuffix] = useState(fact.suffix ?? "");

  return (
    <li className="rounded-md border border-grey-200 bg-stone-050 p-3 text-sm">
      <p>{fact.statementEn}</p>
      <p dir="rtl" className="text-grey-600">
        {fact.statementAr}
      </p>
      <p className="mt-1 font-mono text-xs text-grey-500">id: {fact.id}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input aria-label="Prefix" placeholder="prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-16 rounded-md border border-grey-200 px-2 py-1 text-xs" />
        <input aria-label="Value" placeholder="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-24 rounded-md border border-grey-200 px-2 py-1 text-xs" />
        <input aria-label="Suffix" placeholder="suffix" value={suffix} onChange={(e) => setSuffix(e.target.value)} className="w-16 rounded-md border border-grey-200 px-2 py-1 text-xs" />
        <button
          type="button"
          onClick={() => onSaveStatFields(fact.id, { value: value === "" ? null : Number(value), prefix: prefix || null, suffix: suffix || null })}
          className="rounded-md border border-grey-200 px-2 py-1 text-xs font-semibold text-navy-900"
        >
          Save number
        </button>
        <button onClick={() => onToggleApprove(fact.id, !!fact.approvedAt)} type="button" className={"text-xs font-semibold " + (fact.approvedAt ? "text-teal-600" : "text-grey-500 underline")}>
          {fact.approvedAt ? "Approved" : "Approve"}
        </button>
      </div>
    </li>
  );
}
