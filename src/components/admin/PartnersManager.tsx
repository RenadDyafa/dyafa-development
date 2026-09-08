"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Partner = { id: string; nameEn: string; nameAr: string; active: boolean; approvedAt: string | null };

export function PartnersManager({ partners }: { partners: Partner[] }) {
  const router = useRouter();
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn, nameAr }),
    });
    setNameEn("");
    setNameAr("");
    setBusy(false);
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 rounded-lg border border-grey-200 bg-stone-050 p-4">
        <input required placeholder="Name (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input required dir="rtl" placeholder="الاسم" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
          Add
        </button>
      </form>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
            <th className="py-2 text-start">Name</th>
            <th className="py-2 text-start">Approved &amp; active</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p.id} className="border-b border-grey-100">
              <td className="py-2">
                {p.nameEn} / <span dir="rtl">{p.nameAr}</span>
              </td>
              <td className="py-2">
                <button onClick={() => toggleActive(p.id, p.active)} type="button" className={p.active ? "font-semibold text-teal-600" : "text-grey-500 underline"}>
                  {p.active ? "Active (approved)" : "Not approved — click to approve"}
                </button>
              </td>
            </tr>
          ))}
          {partners.length === 0 && (
            <tr>
              <td colSpan={2} className="py-4 text-grey-500">
                No partners yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
