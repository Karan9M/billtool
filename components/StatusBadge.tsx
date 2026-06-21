import type { InvoiceStatus } from "@/types/invoice";
import { cn } from "@/lib/utils";

const STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  sent: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  paid: "bg-green-100 text-green-800 ring-1 ring-green-200",
  cancelled: "bg-red-100 text-red-800 ring-1 ring-red-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        STYLES[status],
        className
      )}
    >
      {status}
    </span>
  );
}
