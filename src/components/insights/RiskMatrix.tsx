"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export type RiskCategory = { key: string; title: string; mitigation: string };

/**
 * Static, qualitative likelihood x impact grid - a structured way to show
 * "risk is named and tracked," never a numeric risk score (a score would
 * itself be a claim needing approval-gating, per the compliance rules).
 * Each category occupies one cell; clicking/focusing a cell reveals its
 * mitigation note below the grid.
 */
export function RiskMatrix({
  categories,
  likelihoodLabel,
  impactLabel,
}: {
  categories: RiskCategory[];
  likelihoodLabel: string;
  impactLabel: string;
}) {
  const [activeKey, setActiveKey] = useState(categories[0]?.key);
  const active = categories.find((c) => c.key === activeKey);

  // Fixed medium-likelihood / medium-to-high-impact placement - illustrative
  // grid position, not a precise computed score.
  const positions: Record<number, { row: number; col: number }> = {
    0: { row: 1, col: 2 },
    1: { row: 2, col: 1 },
    2: { row: 0, col: 2 },
    3: { row: 1, col: 1 },
  };

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="flex flex-col justify-between py-2 text-xs font-semibold text-slate" style={{ writingMode: "vertical-rl" }}>
          <span className="rotate-180">{likelihoodLabel}</span>
        </div>
        <div>
          <div className="grid grid-cols-3 grid-rows-3 gap-1.5" style={{ aspectRatio: "3 / 3" }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const category = categories.find((_, idx) => positions[idx]?.row === row && positions[idx]?.col === col);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!category}
                  onClick={() => category && setActiveKey(category.key)}
                  className={cn(
                    "hover-lift rounded-md border text-xs font-medium transition-colors",
                    category
                      ? activeKey === category.key
                        ? "border-bronze bg-bronze/15 text-navy-900"
                        : "border-grey-200 bg-stone-050 text-navy-900 hover:border-bronze/60"
                      : "border-transparent bg-stone-050",
                  )}
                >
                  {category?.title}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-slate">{impactLabel}</p>
        </div>
      </div>

      {active && (
        <div className="mt-4 rounded-md border border-grey-200 bg-stone-050 p-4">
          <p className="text-sm font-semibold text-navy-900">{active.title}</p>
          <p className="mt-1 text-sm text-slate">{active.mitigation}</p>
        </div>
      )}
    </div>
  );
}
