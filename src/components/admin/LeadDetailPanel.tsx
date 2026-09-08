"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["new", "contacted", "qualified", "meeting", "handed_to_bd", "closed", "archived"];

type Lead = {
  id: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  notes: Array<{ id: string; body: string; createdAt: string; author: { name: string } }>;
};

export function LeadDetailPanel({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [noteBody, setNoteBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function updateStatus(newStatus: string) {
    setBusy(true);
    setStatus(newStatus);
    await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBusy(false);
    router.refresh();
  }

  async function submitNote() {
    if (!noteBody.trim()) return;
    setBusy(true);
    await fetch(`/api/admin/leads/${lead.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: noteBody }),
    });
    setNoteBody("");
    setBusy(false);
    router.refresh();
  }

  async function pdplDelete() {
    if (!confirm("Permanently delete this lead's personal data (PDPL)? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/admin/leads/${lead.id}/pdpl-delete`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <label htmlFor="status" className="text-sm font-medium text-navy-900">
          Status
        </label>
        <select
          id="status"
          value={status}
          disabled={busy}
          onChange={(e) => updateStatus(e.target.value)}
          className="rounded-md border border-grey-200 px-2 py-1.5 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button onClick={pdplDelete} disabled={busy} type="button" className="ms-auto text-xs font-semibold text-alert hover:underline">
          PDPL delete
        </button>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-navy-900">Notes</h2>
        <div className="mt-3 space-y-3">
          {lead.notes.length === 0 && <p className="text-sm text-grey-500">No notes yet.</p>}
          {lead.notes.map((note) => (
            <div key={note.id} className="rounded-md border border-grey-200 bg-stone-050 p-3 text-sm">
              <p className="text-navy-900">{note.body}</p>
              <p className="mt-1 text-xs text-grey-500">
                {note.author.name} · {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <textarea
            aria-label="Add a note"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Add a note…"
            className="flex-1 rounded-md border border-grey-200 px-3 py-2 text-sm"
            rows={2}
          />
          <button
            type="button"
            onClick={submitNote}
            disabled={busy}
            className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-stone-050 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
