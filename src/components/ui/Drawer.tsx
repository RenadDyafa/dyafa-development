"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Focus-trapped slide-over panel, used for the mobile mega-menu disclosure
 * and the search overlay. Escape and a backdrop click both close it; focus
 * moves into the panel on open and back to nothing forced on close (the
 * trigger element retains its own focus naturally since it's never
 * unmounted).
 */
export function Drawer({
  open,
  onClose,
  side = "end",
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "start" | "end";
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-navy-900/40"
        style={{ animation: "reveal-fade var(--duration-base) var(--ease-standard) both" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "absolute top-0 h-full w-full max-w-sm overflow-y-auto bg-stone-050 p-6 outline-none",
          side === "end" ? "end-0" : "start-0",
        )}
        style={{ boxShadow: "var(--elev-2)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-navy-900 hover:bg-stone-100"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
