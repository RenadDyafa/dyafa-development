"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NEXT_STATES: Record<string, string[]> = {
  draft: ["tech_review", "archived"],
  tech_review: ["draft", "positioning_review", "legal_review"],
  positioning_review: ["draft", "legal_review", "approved"],
  legal_review: ["draft", "approved"],
  approved: ["published", "draft"],
  published: ["archived"],
  archived: [],
};

export function TransitionDialog({ entity, entityId, state }: { entity: string; entityId: string; state: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function transition(toState: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/${entity}/${entityId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_state: toState, note: note || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error?.fields?.blocks?.join(" | ") ?? json.error?.message ?? "Transition failed");
      } else if (json.data.redirectedToLegalReview) {
        setMessage(`Redirected to legal_review due to HIGH-RISK flags.`);
      } else {
        setMessage(`Moved to ${json.data.finalState}.`);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const options = NEXT_STATES[state] ?? [];

  return (
    <div className="rounded-lg border border-grey-200 bg-stone-050 p-4">
      <h3 className="text-sm font-semibold text-navy-900">Transition</h3>
      <textarea
        aria-label="Transition note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        rows={2}
        className="mt-2 w-full rounded-md border border-grey-200 px-3 py-2 text-sm"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy}
            onClick={() => transition(s)}
            className="rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-stone-050 disabled:opacity-50"
          >
            → {s}
          </button>
        ))}
        {options.length === 0 && <p className="text-sm text-grey-500">No further transitions from this state.</p>}
      </div>
      {message && <p className="mt-3 text-sm text-teal-600">{message}</p>}
    </div>
  );
}
