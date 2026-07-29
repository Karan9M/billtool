"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ImportedLedgerEntry, Invoice } from "@/types/invoice";
import { formatCurrency, getFinancialYear } from "@/lib/invoice-utils";

interface Props {
  importedEntries: ImportedLedgerEntry[];
  invoices: Invoice[];
  setupMessage?: string;
}

interface LedgerPoint {
  financialYear: string;
  monthKey: string;
  monthLabel: string;
  sales: number;
  purchases: number;
}

const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
  purchases: { label: "Purchases", color: "hsl(var(--chart-2))" },
  profit: { label: "Profit", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

function addToMap(
  map: Map<string, LedgerPoint>,
  key: string,
  monthLabel: string,
  financialYear: string
) {
  const existing = map.get(key);
  if (existing) return existing;

  const created: LedgerPoint = {
    financialYear,
    monthKey: key,
    monthLabel,
    sales: 0,
    purchases: 0,
  };
  map.set(key, created);
  return created;
}

export function AnalyticsDashboard({ importedEntries, invoices, setupMessage }: Props) {
  const points = useMemo(() => {
    const map = new Map<string, LedgerPoint>();

    for (const entry of importedEntries) {
      if (!entry.invoice_date) continue;
      const date = new Date(entry.invoice_date);
      if (Number.isNaN(date.getTime())) continue;

      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "MMM yy");
      const point = addToMap(map, monthKey, monthLabel, entry.financial_year);
      if (entry.bill_type === "sale") {
        point.sales += Number(entry.total);
      } else {
        point.purchases += Number(entry.total);
      }
    }

    for (const invoice of invoices) {
      const date = new Date(invoice.date);
      if (Number.isNaN(date.getTime())) continue;
      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "MMM yy");
      const financialYear = getFinancialYear(date);
      const point = addToMap(map, monthKey, monthLabel, financialYear);
      point.sales += Number(invoice.total);
    }

    return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [importedEntries, invoices]);

  const financialYears = useMemo(() => {
    const years = Array.from(new Set(points.map((point) => point.financialYear))).sort((a, b) =>
      b.localeCompare(a)
    );
    return years;
  }, [points]);

  const [yearFilter, setYearFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const data = yearFilter === "all" ? points : points.filter((point) => point.financialYear === yearFilter);
    return data.map((point) => ({
      ...point,
      profit: point.sales - point.purchases,
    }));
  }, [points, yearFilter]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, point) => {
        acc.sales += point.sales;
        acc.purchases += point.purchases;
        acc.profit += point.profit;
        return acc;
      },
      { sales: 0, purchases: 0, profit: 0 }
    );
  }, [filtered]);

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sales, purchases, and profit trends from invoices + imported GST bills.
          </p>
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="h-10 w-full sm:w-52">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {financialYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {setupMessage ? (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {setupMessage}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Sales</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(totals.sales)}</CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Purchases</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(totals.purchases)}</CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Profit</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(totals.profit)}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Monthly Sales vs Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[320px] w-full" config={chartConfig}>
              <BarChart data={filtered}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                <Bar dataKey="purchases" fill="var(--color-purchases)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Monthly Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[320px] w-full" config={chartConfig}>
              <LineChart data={filtered}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--color-profit)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
