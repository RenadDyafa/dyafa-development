"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Hover/focus-triggered tooltip. Dependency-free (no popover-positioning
 * library), matching the codebase's zero-extra-deps convention — position
 * is a simple centered-above placement via CSS, adequate for short labels.
 */
export function Tooltip({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute bottom-full start-1/2 z-50 mb-2 w-max max-w-xs -translate-x-1/2 rounded-md bg-navy-900 px-3 py-1.5 text-xs font-medium text-stone-050 rtl:translate-x-1/2"
          style={{ boxShadow: "var(--elev-1)" }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
