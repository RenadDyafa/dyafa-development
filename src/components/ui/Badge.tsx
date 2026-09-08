import { cn } from "@/lib/cn";

const tones = {
  // Tint backgrounds stay on-brand (teal-050/bronze-10% wash) but label
  // text uses navy-900 rather than the tint's own color - Olive Stone or
  // Warm Taupe text on these near-white washes measures ~4.4:1 and ~3.5:1
  // respectively, both short of the 4.5:1 normal-text AA threshold at this
  // badge's font size. alert keeps its own color (it's not a brand tint,
  // already has a wider red/near-white margin).
  neutral: "bg-grey-100 text-navy-900",
  teal: "bg-teal-050 text-navy-900",
  bronze: "bg-bronze/10 text-navy-900",
  alert: "bg-alert/10 text-alert",
} as const;

type Tone = keyof typeof tones;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
