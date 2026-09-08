"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AscentBlock } from "./AscentBlock";
import { cn } from "@/lib/cn";

const HEIGHTS = [28, 46, 66, 88, 112];
const BLOCK_WIDTH = 48;
const GAP = 24;
const FLOOR_Y = 132;

export function GateDiagram() {
  const t = useTranslations("gates");
  const locale = useLocale();
  const [active, setActive] = useState(1);
  const width = HEIGHTS.length * BLOCK_WIDTH + (HEIGHTS.length - 1) * GAP;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <svg
        viewBox={`0 0 ${width} 140`}
        width="100%"
        role="img"
        aria-hidden="true"
        style={locale === "ar" ? { transform: "scaleX(-1)" } : undefined}
      >
        <line x1={0} y1={FLOOR_Y} x2={width} y2={FLOOR_Y} className="stroke-grey-200" strokeWidth={2} />
        {HEIGHTS.map((h, i) => {
          const gate = i + 1;
          return (
            <g
              key={gate}
              style={locale === "ar" ? { transform: "scaleX(-1)", transformOrigin: `${i * (BLOCK_WIDTH + GAP) + BLOCK_WIDTH / 2}px 0` } : undefined}
            >
              {/*
                Purely decorative/mouse-only: the whole <svg> is aria-hidden
                because the text button list below is the one accessible
                control surface for this same "active gate" state — an
                aria-hidden element must never itself be focusable, so no
                tabIndex/role/aria-* here (that combination is what axe-core
                flags as a WCAG 4.1.2 violation).
              */}
              <rect
                x={i * (BLOCK_WIDTH + GAP)}
                y={FLOOR_Y - h}
                width={BLOCK_WIDTH}
                height={h}
                rx={3}
                className={cn(
                  "cursor-pointer transition-colors",
                  active === gate ? "fill-teal-500" : "fill-teal-100 hover:fill-teal-300",
                )}
                onClick={() => setActive(gate)}
              />
              <text
                x={i * (BLOCK_WIDTH + GAP) + BLOCK_WIDTH / 2}
                y={FLOOR_Y - h - 8}
                textAnchor="middle"
                className="fill-navy-900 text-[13px] font-semibold"
                style={locale === "ar" ? { transform: "scaleX(-1)" } : undefined}
              >
                {gate}
              </text>
            </g>
          );
        })}
      </svg>

      <div>
        {HEIGHTS.map((_, i) => {
          const gate = i + 1;
          return (
            <button
              key={gate}
              type="button"
              onClick={() => setActive(gate)}
              className={cn(
                "block w-full rounded-md border-s-4 px-4 py-3 text-start transition-colors",
                active === gate ? "border-teal-500 bg-stone-050/10" : "border-transparent hover:bg-stone-050/5",
              )}
              aria-current={active === gate}
            >
              <p className="text-sm font-semibold text-stone-050">
                {gate}. {t(`${gate}.title`)}
              </p>
              {active === gate && <p className="mt-1 text-sm text-teal-100">{t(`${gate}.body`)}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
