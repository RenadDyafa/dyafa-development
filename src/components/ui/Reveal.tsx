"use client";

import { createElement, type ReactNode } from "react";
import { useScrollReveal } from "@/lib/motion/useScrollReveal";
import { cn } from "@/lib/cn";

type RevealTag = "div" | "section" | "article" | "li" | "span";

type RevealProps = {
  children: ReactNode;
  as?: RevealTag;
  variant?: "up" | "fade";
  delayMs?: number;
  className?: string;
};

/**
 * Thin client boundary around useScrollReveal so server-rendered marketing
 * pages can wrap static JSX in a staggered scroll-reveal without becoming
 * client components themselves — only <Reveal> crosses the client boundary,
 * its children are passed through untouched. Uses createElement (rather
 * than JSX with a variable tag) to avoid the ref-typing friction of a
 * dynamic intrinsic-element union.
 */
export function Reveal({ children, as: Tag = "div", variant = "up", delayMs = 0, className }: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return createElement(
    Tag,
    {
      ref,
      className: cn(visible && (variant === "up" ? "reveal-up" : "reveal-fade"), className),
      style: visible ? { animationDelay: `${delayMs}ms` } : { opacity: 0 },
    },
    children,
  );
}
