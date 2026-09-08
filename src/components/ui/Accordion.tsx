"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = {
  key: string;
  title: string;
  content: React.ReactNode;
};

/**
 * Controlled disclosure list (not native <details>, so open state can be
 * driven consistently across RTL/LTR and styled without UA quirks). Used
 * for FAQs and the Modular Hospitality "what it means / what it doesn't"
 * content.
 */
export function Accordion({ items, allowMultiple = false }: { items: AccordionItem[]; allowMultiple?: boolean }) {
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  function toggle(key: string) {
    setOpenKeys((prev) => {
      const isOpen = prev.includes(key);
      if (allowMultiple) {
        return isOpen ? prev.filter((k) => k !== key) : [...prev, key];
      }
      return isOpen ? [] : [key];
    });
  }

  return (
    <div className="divide-y divide-grey-200 border-y border-grey-200">
      {items.map((item) => {
        const open = openKeys.includes(item.key);
        return (
          <div key={item.key}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => toggle(item.key)}
              className="flex w-full items-center justify-between gap-4 py-4 text-start text-sm font-semibold text-navy-900"
            >
              <span>{item.title}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className={cn("shrink-0 transition-transform", open && "rotate-45")}
                style={{ transitionDuration: "var(--duration-base)" }}
              >
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {open && <div className="pb-4 text-sm text-slate">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
