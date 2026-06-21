"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Banknote,
  CalendarRange,
  FilePlus2,
  Files,
  Hourglass,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

import type { Invoice } from "@/types/invoice";
import { formatCurrency } from "@/lib/invoice-utils";

interface Props {
  invoices: Invoice[];
}

export function Dashboard({ invoices }: Props) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);

  const monthRevenue = invoices
    .filter((i) => i.status === "paid" && new Date(i.date) >= monthStart)
    .reduce((s, i) => s + Number(i.total), 0);

  const prevMonthRevenue = invoices
    .filter((i) => i.status === "paid" && new Date(i.date) >= prevMonthStart && new Date(i.date) < monthStart)
    .reduce((s, i) => s + Number(i.total), 0);

  const pending = invoices.filter(
    (i) => i.status === "draft" || i.status === "sent"
  ).length;

  const recent = invoices.slice(0, 8);

  const monthChange = prevMonthRevenue > 0
    ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
    : 0;

  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: Banknote,
      hint: "All paid invoices",
      trend: null as number | null,
      trendLabel: "",
    },
    {
      label: "This Month",
      value: formatCurrency(monthRevenue),
      icon: CalendarRange,
      hint: format(now, "MMMM yyyy"),
      trend: Math.round(monthChange * 10) / 10,
      trendLabel: monthChange >= 0 ? `vs last month` : `vs last month`,
    },
    {
      label: "Total Invoices",
      value: invoices.length.toString(),
      icon: Files,
      hint: "All time",
      trend: null,
      trendLabel: "",
    },
    {
      label: "Pending",
      value: pending.toString(),
      icon: Hourglass,
      hint: "Draft + Sent",
      trend: null,
      trendLabel: "",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your business.
          </p>
        </div>
        <Link href="/invoices/new">
          <Button size="lg" className="shadow-xs">
            <FilePlus2 className="size-4" />
            New Invoice
          </Button>
        </Link>
      </motion.header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Card className="overflow-hidden border-0 bg-card shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                        {c.label}
                      </p>
                      <p className="text-2xl font-bold leading-tight tracking-tight text-foreground">
                        {c.value}
                      </p>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5">
                      <Icon className="size-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    {c.trend !== null && c.trend !== 0 && (
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                          c.trend > 0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {c.trend > 0 ? (
                          <TrendingUp className="size-3" />
                        ) : (
                          <TrendingDown className="size-3" />
                        )}
                        {Math.abs(c.trend).toFixed(1)}%
                      </span>
                    )}
                    <span>{c.hint}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Recent Invoices
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Latest {Math.min(recent.length, 8)} of {invoices.length} invoices
                </p>
              </div>
              <Link
                href="/invoices"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Files className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No invoices yet</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Create your first invoice to get started.
                  </p>
                </div>
                <Link href="/invoices/new">
                  <Button size="sm" className="mt-1">
                    <FilePlus2 className="size-3.5" />
                    Create Invoice
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recent.map((inv, i) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                  >
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                        <span className="font-mono text-xs font-bold text-primary">
                          {inv.invoice_no.slice(-3)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {inv.invoice_no}
                          </span>
                          <StatusBadge status={inv.status} />
                        </div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          {inv.buyer_name || "Unnamed buyer"} &middot;{" "}
                          {format(new Date(inv.date), "dd MMM yyyy")}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-sm font-bold text-foreground">
                          {formatCurrency(Number(inv.total))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
