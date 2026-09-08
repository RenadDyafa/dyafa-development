"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Card = { id: string; kind: string; title: string; subtitle: string; href: string; priority?: string };
type Columns = { todo: Card[]; in_progress: Card[]; blocked: Card[]; done: Card[] };

const COLUMN_LABELS: Record<keyof Columns, string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

const KIND_BADGE: Record<string, string> = {
  task: "bg-navy-900 text-stone-050",
  content_workflow: "bg-teal-050 text-navy-900",
  lead_pipeline: "bg-bronze/10 text-navy-900",
};

export function TaskBoard() {
  const [columns, setColumns] = useState<Columns | null>(null);

  useEffect(() => {
    fetch("/api/admin/tasks/board")
      .then((r) => r.json())
      .then((json) => setColumns(json.data));
  }, []);

  if (!columns) return <p className="text-sm text-grey-500">Loading…</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(COLUMN_LABELS) as Array<keyof Columns>).map((key) => (
        <div key={key} className="rounded-lg border border-grey-200 bg-stone-050 p-3">
          <p className="text-xs font-semibold uppercase text-grey-500">
            {COLUMN_LABELS[key]} ({columns[key].length})
          </p>
          <div className="mt-3 space-y-2">
            {columns[key].map((card) => (
              <Link key={card.id} href={card.href} className="block rounded-md border border-grey-200 bg-stone-050 p-3 hover:border-teal-500">
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${KIND_BADGE[card.kind]}`}>
                  {card.kind.replace("_", " ")}
                </span>
                <p className="mt-1 text-sm font-medium text-navy-900">{card.title}</p>
                <p className="text-xs text-grey-500">{card.subtitle}</p>
              </Link>
            ))}
            {columns[key].length === 0 && <p className="text-xs text-grey-600">Nothing here.</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
