"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FilePlus2, Search } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

import type { Invoice, InvoiceStatus } from "@/types/invoice";
import { formatCurrency } from "@/lib/invoice-utils";
import { cn } from "@/lib/utils";

type Filter = "all" | InvoiceStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "paid", label: "Paid" },
  { key: "cancelled", label: "Cancelled" },
];

export function InvoicesList({ initial }: { initial: Invoice[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return initial.filter((inv) => {
      if (filter !== "all" && inv.status !== filter) return false;
      if (!needle) return true;
      return (
        inv.invoice_no.toLowerCase().includes(needle) ||
        inv.buyer_name.toLowerCase().includes(needle)
      );
    });
  }, [initial, q, filter]);

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Invoices</h1>
          <p className="text-sm text-muted-foreground">
            {initial.length} total · {filtered.length} shown
          </p>
        </div>
        <Link href="/invoices/new">
          <Button size="lg">
            <FilePlus2 className="size-4" />
            New Invoice
          </Button>
        </Link>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by invoice no. or buyer name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 pl-9"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
              filter === f.key
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-background text-muted-foreground ring-border hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No invoices match your filters.
          </p>
          <Link
            href="/invoices/new"
            className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
          >
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((inv, i) => (
              <motion.div
                key={inv.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
              >
                <Link
                  href={`/invoices/${inv.id}`}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">
                        {inv.invoice_no}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="truncate text-sm text-foreground">
                      {inv.buyer_name || "Unnamed buyer"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(inv.date), "dd MMM yyyy")} ·{" "}
                      {Array.isArray(inv.items) ? inv.items.length : 0} item
                      {Array.isArray(inv.items) && inv.items.length === 1
                        ? ""
                        : "s"}
                    </div>
                  </div>
                  <div className="text-right font-mono text-base font-bold">
                    {formatCurrency(Number(inv.total))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
