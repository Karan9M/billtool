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

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);

  const monthRevenue = invoices
    .filter((i) => i.status === "paid" && new Date(i.date) >= monthStart)
    .reduce((s, i) => s + Number(i.total), 0);

  const pending = invoices.filter(
    (i) => i.status === "draft" || i.status === "sent"
  ).length;

  const recent = invoices.slice(0, 8);

  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: Banknote,
      hint: "Paid invoices",
      tint: "text-green-700 bg-green-50",
    },
    {
      label: "This Month",
      value: formatCurrency(monthRevenue),
      icon: CalendarRange,
      hint: format(now, "MMMM yyyy"),
      tint: "text-blue-700 bg-blue-50",
    },
    {
      label: "Total Invoices",
      value: invoices.length.toString(),
      icon: Files,
      hint: "All time",
      tint: "text-purple-700 bg-purple-50",
    },
    {
      label: "Pending",
      value: pending.toString(),
      icon: Hourglass,
      hint: "Draft + Sent",
      tint: "text-amber-700 bg-amber-50",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your invoicing activity.
          </p>
        </div>
        <Link href="/invoices/new">
          <Button size="lg">
            <FilePlus2 className="size-4" />
            New Invoice
          </Button>
        </Link>
      </motion.header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold leading-tight">
                      {c.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.hint}
                    </p>
                  </div>
                  <div
                    className={`inline-flex size-10 items-center justify-center rounded-full ${c.tint}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Recent Invoices</h2>
              <Link
                href="/invoices"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No invoices yet.
                <Link
                  href="/invoices/new"
                  className="ml-1 font-medium text-primary hover:underline"
                >
                  Create the first one →
                </Link>
              </div>
            ) : (
              <ul className="divide-y">
                {recent.map((inv) => (
                  <li key={inv.id}>
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="flex items-center gap-3 py-3 transition hover:bg-muted/30 -mx-1 px-1 rounded"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">
                            {inv.invoice_no}
                          </span>
                          <StatusBadge status={inv.status} />
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {inv.buyer_name || "Unnamed buyer"} ·{" "}
                          {format(new Date(inv.date), "dd MMM yyyy")}
                        </div>
                      </div>
                      <div className="font-mono text-sm font-bold">
                        {formatCurrency(Number(inv.total))}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
