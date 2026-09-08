import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="text-sm font-semibold text-teal-600">{eyebrow}</p>}
      <h2 className="mt-1 text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-slate">{subtitle}</p>}
    </div>
  );
}
