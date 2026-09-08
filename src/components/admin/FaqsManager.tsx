"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Faq = { id: string; questionEn: string; questionAr: string; active: boolean };

export function FaqsManager({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [questionEn, setQuestionEn] = useState("");
  const [questionAr, setQuestionAr] = useState("");
  const [answerEn, setAnswerEn] = useState("");
  const [answerAr, setAnswerAr] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionEn, questionAr, answerEn, answerAr }),
    });
    setQuestionEn("");
    setQuestionAr("");
    setAnswerEn("");
    setAnswerAr("");
    setBusy(false);
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/faqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="space-y-3 rounded-lg border border-grey-200 bg-stone-050 p-4">
        <input required placeholder="Question (EN)" value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <input required dir="rtl" placeholder="السؤال" value={questionAr} onChange={(e) => setQuestionAr(e.target.value)} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <textarea required placeholder="Answer (EN)" value={answerEn} onChange={(e) => setAnswerEn(e.target.value)} rows={2} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <textarea required dir="rtl" placeholder="الإجابة" value={answerAr} onChange={(e) => setAnswerAr(e.target.value)} rows={2} className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm" />
        <button type="submit" disabled={busy} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 hover:bg-navy-800 disabled:opacity-50">
          Add
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {faqs.map((f) => (
          <li key={f.id} className="rounded-md border border-grey-200 bg-stone-050 p-3 text-sm">
            <p className="font-medium text-navy-900">{f.questionEn}</p>
            <button onClick={() => toggleActive(f.id, f.active)} type="button" className={"mt-2 text-xs font-semibold " + (f.active ? "text-teal-600" : "text-grey-500 underline")}>
              {f.active ? "Published" : "Not published — click to publish"}
            </button>
          </li>
        ))}
        {faqs.length === 0 && <p className="text-sm text-grey-500">No FAQs yet.</p>}
      </ul>
    </div>
  );
}
