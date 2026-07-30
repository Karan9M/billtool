"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowRight,
  Banknote,
  CalendarRange,
  FilePlus2,
  Files,
  Hourglass,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import type { Invoice } from "@/types/invoice";
import { formatCurrency } from "@/lib/invoice-utils";

interface Props {
  invoices: Invoice[];
}

export function Dashboard({ invoices }: Props) {
  const reduceMotion = useReducedMotion();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const monthRevenue = invoices
    .filter(
      (invoice) =>
        invoice.status === "paid" && new Date(invoice.date) >= monthStart
    )
    .reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const prevMonthRevenue = invoices
    .filter(
      (invoice) =>
        invoice.status === "paid" &&
        new Date(invoice.date) >= prevMonthStart &&
        new Date(invoice.date) < monthStart
    )
    .reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const pending = invoices.filter(
    (invoice) => invoice.status === "draft" || invoice.status === "sent"
  ).length;
  const recent = invoices.slice(0, 6);
  const monthChange =
    prevMonthRevenue > 0
      ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 1000) / 10
      : null;

  const stats = [
    { label: "Total collected", value: formatCurrency(totalRevenue), note: "All paid invoices", icon: Banknote },
    { label: "This month", value: formatCurrency(monthRevenue), note: format(now, "MMMM yyyy"), icon: CalendarRange },
    { label: "Invoices", value: invoices.length.toString(), note: "Created so far", icon: Files },
    { label: "Needs attention", value: pending.toString(), note: "Drafts and sent", icon: Hourglass },
  ];

  const reveal = reduceMotion
    ? { initial: false }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-full bg-background px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
      <div className="mx-auto w-full max-w-6xl">
        <motion.header
          {...reveal}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {format(now, "EEEE, d MMMM")}
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-4xl">
              Good to see you.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Here&apos;s a quick look at your invoicing today.
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_8px_18px_rgba(34,95,99,0.18)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_22px_rgba(34,95,99,0.25)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
          >
            <FilePlus2 className="size-4" />
            Create invoice
          </Link>
        </motion.header>

        <motion.section
          {...reveal}
          transition={{ duration: 0.24, delay: reduceMotion ? 0 : 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_10px_30px_rgba(34,95,99,0.06)]"
          aria-label="Business overview"
        >
          <div className="grid divide-y divide-border/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {stats.map(({ label, value, note, icon: Icon }) => (
              <div key={label} className="group min-w-0 px-5 py-5 transition-colors duration-200 hover:bg-secondary/45 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary transition-transform duration-200 ease-out group-hover:scale-105">
                    <Icon className="size-4" />
                  </div>
                </div>
                <p className="mt-5 font-mono text-2xl font-semibold tracking-[-0.05em] text-foreground">{value}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
          {monthChange !== null && (
            <div className="flex items-center gap-2 border-t border-border/70 bg-secondary/35 px-5 py-3 text-xs text-muted-foreground sm:px-6">
              <span className={monthChange >= 0 ? "text-primary" : "text-destructive"}>
                {monthChange >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              </span>
              <span><strong className="font-semibold text-foreground">{Math.abs(monthChange).toFixed(1)}%</strong> {monthChange >= 0 ? "up" : "down"} from last month</span>
            </div>
          )}
        </motion.section>

        <motion.section
          {...reveal}
          transition={{ duration: 0.24, delay: reduceMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_10px_30px_rgba(34,95,99,0.06)]"
        >
          <div className="flex items-center justify-between px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-semibold tracking-[-0.02em] text-foreground">Recent invoices</h2>
              <p className="mt-1 text-xs text-muted-foreground">Your latest work, all in one place.</p>
            </div>
            {recent.length > 0 && (
              <Link href="/invoices" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                See all <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="border-t border-border/70 px-5 py-14 text-center sm:px-6">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Files className="size-5" /></div>
              <p className="mt-4 text-sm font-semibold text-foreground">Your invoice list is clear</p>
              <p className="mt-1 text-sm text-muted-foreground">Create the first one when you&apos;re ready.</p>
              <Link href="/invoices/new" className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-transform duration-150 active:scale-[0.98]">
                <FilePlus2 className="size-3.5" /> Create invoice
              </Link>
            </div>
          ) : (
            <div className="border-t border-border/70">
              {recent.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="group flex items-center gap-3 border-b border-border/55 px-5 py-4 last:border-b-0 transition-colors duration-150 hover:bg-secondary/45 focus-visible:bg-secondary/45 focus-visible:outline-none sm:gap-4 sm:px-6"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-mono text-xs font-semibold text-primary transition-transform duration-200 ease-out group-hover:scale-105">
                    {invoice.invoice_no.slice(-3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">{invoice.invoice_no}</span>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {invoice.buyer_name || "Unnamed buyer"} <span aria-hidden="true">·</span> {format(new Date(invoice.date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold text-foreground">{formatCurrency(Number(invoice.total))}</p>
                    <ArrowRight className="ml-auto mt-1 size-3.5 text-muted-foreground opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
