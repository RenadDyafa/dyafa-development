"use client";

import { useEffect, useState } from "react";
import { useScrollReveal } from "@/lib/motion/useScrollReveal";
import { cn } from "@/lib/cn";

export type Metric = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sourceNote?: string;
};

function CountUpValue({ value, visible }: { value: number; visible: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const durationMs = 1200;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value]);

  return <>{display.toLocaleString()}</>;
}

/**
 * Only ever renders approved, real metrics passed in by the caller — never
 * invents a number itself. Counts up once when scrolled into view; the
 * count-up is purely decorative so it's safe to skip under reduced motion
 * (CountUpValue jumps straight to the final value in that case).
 */
export function MetricStrip({ metrics, tone = "light" }: { metrics: Metric[]; tone?: "light" | "dark" }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="grid grid-cols-2 gap-8 sm:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <p className={cn("text-3xl font-bold sm:text-4xl", tone === "dark" ? "text-stone-050" : "text-navy-900")}>
            {metric.prefix}
            <CountUpValue value={metric.value} visible={visible} />
            {metric.suffix}
          </p>
          <p className={cn("mt-1 text-sm font-medium", tone === "dark" ? "text-teal-100" : "text-slate")}>{metric.label}</p>
          {metric.sourceNote && <p className={cn("mt-0.5 text-xs", tone === "dark" ? "text-teal-100/70" : "text-slate")}>{metric.sourceNote}</p>}
        </div>
      ))}
    </div>
  );
}
