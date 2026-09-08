const STATE_LABELS: Record<string, string> = {
  draft: "Draft",
  tech_review: "Technical review",
  positioning_review: "Positioning review",
  legal_review: "Legal review",
  approved: "Approved",
  published: "Published",
  archived: "Archived",
};

const STATE_ORDER = ["draft", "tech_review", "positioning_review", "legal_review", "approved", "published"];

export function WorkflowStatusBar({ state }: { state: string }) {
  const currentIndex = STATE_ORDER.indexOf(state);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATE_ORDER.map((s, i) => (
        <span
          key={s}
          className={
            "rounded-full px-3 py-1 text-xs font-semibold " +
            (s === state
              ? "bg-navy-900 text-stone-050"
              : i < currentIndex
                ? "bg-teal-100 text-teal-600"
                : "bg-stone-100 text-grey-500")
          }
        >
          {STATE_LABELS[s] ?? s}
        </span>
      ))}
      {state === "archived" && <span className="rounded-full bg-grey-200 px-3 py-1 text-xs font-semibold text-grey-600">Archived</span>}
    </div>
  );
}
