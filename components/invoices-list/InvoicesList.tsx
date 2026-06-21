"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FilePlus2, Search, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

import type { Invoice, InvoiceStatus } from "@/types/invoice";
import { formatCurrency } from "@/lib/invoice-utils";
import { cn } from "@/lib/utils";

type Filter = "all" | InvoiceStatus;

const FILTERS: { key: Filter; label: string; count?: number }[] = [
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

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: initial.length };
    for (const s of ["draft", "sent", "paid", "cancelled"] as const) {
      c[s] = initial.filter((i) => i.status === s).length;
    }
    return c;
  }, [initial]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Invoices
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {initial.length} total &middot; {filtered.length} shown
          </p>
        </div>
        <Link href="/invoices/new">
          <Button size="lg" className="shadow-xs">
            <FilePlus2 className="size-4" />
            New Invoice
          </Button>
        </Link>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by invoice no. or buyer name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 pl-9 bg-card text-sm"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.08 }}
        className="mb-5 flex flex-wrap gap-1.5"
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
              filter === f.key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground ring-1 ring-border hover:bg-muted"
            )}
          >
            {f.label}
            <span
              className={cn(
                "inline-flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
                filter === f.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted-foreground/10 text-muted-foreground"
              )}
            >
              {counts[f.key] ?? 0}
            </span>
          </button>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <SlidersHorizontal className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No invoices match</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
          {q || filter !== "all" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Link href="/invoices/new">
              <Button size="sm">
                <FilePlus2 className="size-3.5" />
                Create Invoice
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((inv, i) => (
              <motion.div
                key={inv.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(i * 0.015, 0.15),
                  layout: { duration: 0.2 },
                }}
              >
                <Link
                  href={`/invoices/${inv.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-4 transition-all duration-150 hover:border-primary/20 hover:shadow-sm"
                >
                  <div className="hidden shrink-0 sm:flex sm:size-10 sm:items-center sm:justify-center sm:rounded-lg sm:bg-primary/5">
                    <span className="font-mono text-xs font-bold text-primary">
                      {inv.invoice_no.slice(-3)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {inv.invoice_no}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate max-w-[200px]">
                        {inv.buyer_name || "Unnamed buyer"}
                      </span>
                      <span className="hidden sm:inline">&middot;</span>
                      <span className="hidden sm:inline">
                        {format(new Date(inv.date), "dd MMM yyyy")}
                      </span>
                      <span>&middot;</span>
                      <span>
                        {Array.isArray(inv.items) ? inv.items.length : 0} item
                        {Array.isArray(inv.items) && inv.items.length === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <div className="font-mono text-sm font-bold text-foreground">
                      {formatCurrency(Number(inv.total))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {format(new Date(inv.date), "dd MMM")}
                    </div>
                  </div>

                  <div className="shrink-0 text-right sm:hidden">
                    <div className="font-mono text-sm font-bold text-foreground">
                      {formatCurrency(Number(inv.total))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {format(new Date(inv.date), "dd MMM")}
                    </div>
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
