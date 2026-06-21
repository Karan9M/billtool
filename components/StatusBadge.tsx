import type { InvoiceStatus } from "@/types/invoice";
import { cn } from "@/lib/utils";

const STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  sent: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60",
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
};

const DOTS: Record<InvoiceStatus, string> = {
  draft: "bg-amber-500",
  sent: "bg-blue-500",
  paid: "bg-emerald-500",
  cancelled: "bg-red-500",
};

export function StatusBadge({
  status,
  className,
  size = "sm",
}: {
  status: InvoiceStatus;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        STYLES[status],
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOTS[status])} />
      {status}
    </span>
  );
}
