import { cn } from "@/lib/cn";

/**
 * Loading placeholder for route-segment loading.tsx files and any
 * client-fetched panel. Uses Tailwind's built-in animate-pulse — no new
 * keyframe needed, and it already respects the global
 * prefers-reduced-motion override since that override targets `animation-*`
 * generically.
 */
export function Skeleton({
  variant = "text",
  count = 1,
  className,
}: {
  variant?: "text" | "card" | "avatar";
  count?: number;
  className?: string;
}) {
  const shapeClass =
    variant === "card"
      ? "h-48 w-full rounded-lg"
      : variant === "avatar"
        ? "h-12 w-12 rounded-full"
        : "h-4 w-full rounded";

  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("animate-pulse bg-grey-100", shapeClass, className)} />
      ))}
    </div>
  );
}
