"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TeamMember = {
  id: string;
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  active: boolean;
  approvedAt: string | null;
};

export function TeamManager({ teamMembers }: { teamMembers: TeamMember[] }) {
  const router = useRouter();
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [roleEn, setRoleEn] = useState("");
  const [roleAr, setRoleAr] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn, nameAr, roleEn, roleAr }),
    });
    setNameEn("");
    setNameAr("");
    setRoleEn("");
    setRoleAr("");
    setBusy(false);
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="grid gap-3 rounded-lg border border-grey-200 bg-stone-050 p-4 sm:grid-cols-2">
        <input required placeholder="Name (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input required dir="rtl" placeholder="الاسم" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input required placeholder="Role (EN)" value={roleEn} onChange={(e) => setRoleEn(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input required dir="rtl" placeholder="المسمى الوظيفي" value={roleAr} onChange={(e) => setRoleAr(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50 sm:col-span-2 sm:w-fit">
          Add
        </button>
      </form>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
            <th className="py-2 text-start">Name</th>
            <th className="py-2 text-start">Role</th>
            <th className="py-2 text-start">Published</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((m) => (
            <tr key={m.id} className="border-b border-grey-100">
              <td className="py-2">{m.nameEn}</td>
              <td className="py-2">{m.roleEn}</td>
              <td className="py-2">
                <button onClick={() => toggleActive(m.id, m.active)} type="button" className={m.active ? "font-semibold text-teal-600" : "text-grey-500 underline"}>
                  {m.active ? "Published" : "Not published — click to publish"}
                </button>
              </td>
            </tr>
          ))}
          {teamMembers.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-grey-500">
                No team members yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
