import { cn } from "@/lib/cn";

/**
 * Multi-step progress indicator with back-navigation: clicking a completed
 * step jumps back to it (needed by the Submit Your Site wizard so a visitor
 * can correct an earlier answer without restarting). Steps ahead of the
 * current one are shown but not clickable.
 */
export function Stepper({
  steps,
  currentIndex,
  onStepClick,
}: {
  steps: string[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <div>
      <ol className="flex items-center gap-2" aria-label="Progress">
        {steps.map((label, index) => {
          const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
          const clickable = state === "done" && !!onStepClick;

          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(index)}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  state === "done" && "bg-navy-900 text-stone-050",
                  state === "current" && "border-2 border-bronze text-navy-900",
                  state === "upcoming" && "border border-grey-200 text-slate",
                  clickable && "cursor-pointer hover:opacity-80",
                )}
              >
                {state === "done" ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:inline",
                  state === "upcoming" ? "text-slate" : "text-navy-900",
                )}
              >
                {label}
              </span>
              {index < steps.length - 1 && <span className="h-px flex-1 bg-grey-200" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
      {/* Desktop shows every step's label inline; below sm: there isn't room
          for that with 5 steps, so the circles alone left visitors with no
          idea what each step meant - show just the current one instead. */}
      <p className="mt-3 text-center text-sm font-semibold text-navy-900 sm:hidden">
        {currentIndex + 1}/{steps.length} · {steps[currentIndex]}
      </p>
    </div>
  );
}
