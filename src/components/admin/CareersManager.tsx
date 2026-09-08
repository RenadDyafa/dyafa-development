"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type JobPosting = {
  id: string;
  titleEn: string;
  titleAr: string;
  employmentType: string;
  active: boolean;
};

const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "internship"] as const;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
}

export function CareersManager({ jobPostings }: { jobPostings: JobPosting[] }) {
  const router = useRouter();
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [employmentType, setEmploymentType] = useState<(typeof EMPLOYMENT_TYPES)[number]>("full_time");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/admin/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slugify(titleEn) || `role-${Date.now()}`,
        titleEn,
        titleAr,
        employmentType,
        descriptionEn: "",
        descriptionAr: "",
      }),
    });
    setTitleEn("");
    setTitleAr("");
    setBusy(false);
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/careers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="grid gap-3 rounded-lg border border-grey-200 bg-stone-050 p-4 sm:grid-cols-2">
        <input required placeholder="Title (EN)" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input required dir="rtl" placeholder="المسمى الوظيفي" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className="rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as typeof employmentType)} className="rounded-md border border-grey-200 px-3 py-2 text-sm">
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
        <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50 sm:w-fit">
          Add
        </button>
      </form>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-grey-200 text-xs uppercase text-grey-500">
            <th className="py-2 text-start">Title</th>
            <th className="py-2 text-start">Type</th>
            <th className="py-2 text-start">Published</th>
          </tr>
        </thead>
        <tbody>
          {jobPostings.map((j) => (
            <tr key={j.id} className="border-b border-grey-100">
              <td className="py-2">{j.titleEn}</td>
              <td className="py-2">{j.employmentType.replace("_", " ")}</td>
              <td className="py-2">
                <button onClick={() => toggleActive(j.id, j.active)} type="button" className={j.active ? "font-semibold text-teal-600" : "text-grey-500 underline"}>
                  {j.active ? "Published" : "Not published — click to publish"}
                </button>
              </td>
            </tr>
          ))}
          {jobPostings.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-grey-500">
                No job postings yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
