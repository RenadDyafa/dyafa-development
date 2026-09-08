import { cn } from "@/lib/cn";

export function Toast({
  variant = "success",
  children,
}: {
  variant?: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-md border px-4 py-3 text-sm",
        variant === "success" && "border-teal-300 bg-teal-050 text-teal-600",
        variant === "error" && "border-alert/40 bg-alert/10 text-alert",
      )}
    >
      {children}
    </div>
  );
}
