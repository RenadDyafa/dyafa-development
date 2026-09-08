import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Link } from "@/lib/i18n/navigation";

const variants = {
  // Every brand color other than Charcoal Black falls short of 4.5:1 with
  // any approved light text at normal size (Olive Stone + Off White is
  // 4.39:1, Warm Taupe worse) — confirmed via axe-core, not just arithmetic.
  // Charcoal Black is the only one of the 6 exact approved colors that
  // reaches AA as a solid fill, so both solid-fill variants use it; they
  // stay two names for call-site clarity even though visually identical.
  primary: "bg-navy-900 text-stone-050 hover:opacity-90 focus-visible:opacity-90",
  secondary: "bg-navy-900 text-stone-050 hover:opacity-90",
  outline: "border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-stone-050",
  ghost: "text-navy-900 hover:bg-stone-100",
} as const;

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
