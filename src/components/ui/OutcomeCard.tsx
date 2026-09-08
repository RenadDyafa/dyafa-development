import { cn } from "@/lib/cn";

export function OutcomeCard({
  title,
  body,
  cta,
  className,
}: {
  title: string;
  body: string;
  cta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-grey-200 bg-stone-050 p-6", className)}>
      <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm text-slate">{body}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
