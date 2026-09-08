import { MetricStrip, type Metric } from "@/components/ui/MetricStrip";

/**
 * A lean, high-impact banded number strip (inspired by AlUla's homepage -
 * see docs/competitor-analysis.md) - a dark band with a handful of large,
 * approved numbers reads better than burying stats among many sections.
 * Reuses MetricStrip as-is (count-up, 2x2 mobile grid, reduced-motion safe)
 * rather than rebuilding it; only ever renders metrics the caller already
 * fetched from approved, structured ApprovedFact rows.
 */
export function StatStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="bg-navy-900 py-16 text-stone-050">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MetricStrip metrics={metrics} tone="dark" />
      </div>
    </section>
  );
}
