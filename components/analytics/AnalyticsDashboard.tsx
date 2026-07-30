"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ImportedLedgerEntry, Invoice } from "@/types/invoice";
import { formatCurrency, getFinancialYear } from "@/lib/invoice-utils";

interface Props {
  importedEntries: ImportedLedgerEntry[];
  invoices: Invoice[];
  setupMessage?: string;
}

interface MonthlyData {
  financialYear: string;
  monthKey: string;
  monthLabel: string;
  sales: number;
  purchases: number;
  profit: number;
  profitMargin: number;
  salesGst: number;
  purchaseGst: number;
  netGst: number;
}

interface PartyRow {
  name: string;
  sales: number;
  purchases: number;
  salesCount: number;
  purchasesCount: number;
  total: number;
}

interface YoYRow {
  year: string;
  sales: number;
  purchases: number;
  profit: number;
  profitMargin: number;
  salesGst: number;
  purchaseGst: number;
  netGst: number;
  salesCount: number;
  purchasesCount: number;
}

const chartColors = {
  sales: "hsl(var(--chart-1))",
  purchases: "hsl(var(--chart-2))",
  profit: "hsl(var(--chart-3))",
  gst: "hsl(var(--chart-4))",
  netGst: "hsl(var(--chart-5))",
};

function addToMap(
  map: Map<string, MonthlyData>,
  key: string,
  monthLabel: string,
  financialYear: string,
) {
  let point = map.get(key);
  if (!point) {
    point = {
      financialYear,
      monthKey: key,
      monthLabel,
      sales: 0,
      purchases: 0,
      profit: 0,
      profitMargin: 0,
      salesGst: 0,
      purchaseGst: 0,
      netGst: 0,
    };
    map.set(key, point);
  }
  return point;
}

export function AnalyticsDashboard({ importedEntries, invoices, setupMessage }: Props) {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [detailFilter, setDetailFilter] = useState("");
  const [detailTab, setDetailTab] = useState("table");

  const points = useMemo(() => {
    const map = new Map<string, MonthlyData>();

    for (const entry of importedEntries) {
      if (!entry.invoice_date) continue;
      const date = new Date(entry.invoice_date);
      if (Number.isNaN(date.getTime())) continue;

      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "MMM yy");
      const point = addToMap(map, monthKey, monthLabel, entry.financial_year);

      const total = Number(entry.total);
      const gst = Number(entry.cgst_amount) + Number(entry.sgst_amount) + Number(entry.igst_amount);

      if (entry.bill_type === "sale") {
        point.sales += total;
        point.salesGst += gst;
      } else {
        point.purchases += total;
        point.purchaseGst += gst;
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
      point.salesGst +=
        Number(invoice.cgst_amount) + Number(invoice.sgst_amount) + Number(invoice.igst_amount);
    }

    return Array.from(map.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map((p) => ({
        ...p,
        profit: p.sales - p.purchases,
        profitMargin: p.sales > 0 ? ((p.sales - p.purchases) / p.sales) * 100 : 0,
        netGst: p.salesGst - p.purchaseGst,
      }));
  }, [importedEntries, invoices]);

  const financialYears = useMemo(() => {
    const years = Array.from(new Set(points.map((p) => p.financialYear))).sort((a, b) =>
      b.localeCompare(a),
    );
    return years;
  }, [points]);

  const filtered = useMemo(() => {
    return yearFilter === "all"
      ? points
      : points.filter((p) => p.financialYear === yearFilter);
  }, [points, yearFilter]);

  const yearlyData = useMemo(() => {
    const map = new Map<string, YoYRow>();
    for (const p of points) {
      let row = map.get(p.financialYear);
      if (!row) {
        row = {
          year: p.financialYear,
          sales: 0,
          purchases: 0,
          profit: 0,
          profitMargin: 0,
          salesGst: 0,
          purchaseGst: 0,
          netGst: 0,
          salesCount: 0,
          purchasesCount: 0,
        };
        map.set(p.financialYear, row);
      }
      row.sales += p.sales;
      row.purchases += p.purchases;
      row.profit += p.profit;
      row.salesGst += p.salesGst;
      row.purchaseGst += p.purchaseGst;
      row.netGst += p.netGst;
    }
    return Array.from(map.values())
      .map((r) => ({
        ...r,
        profitMargin: r.sales > 0 ? (r.profit / r.sales) * 100 : 0,
      }))
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [points]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, p) => {
        acc.sales += p.sales;
        acc.purchases += p.purchases;
        acc.profit += p.profit;
        acc.salesGst += p.salesGst;
        acc.purchaseGst += p.purchaseGst;
        acc.netGst += p.netGst;
        return acc;
      },
      { sales: 0, purchases: 0, profit: 0, salesGst: 0, purchaseGst: 0, netGst: 0 },
    );
  }, [filtered]);

  const profitMargin = totals.sales > 0 ? (totals.profit / totals.sales) * 100 : 0;

  const partyData = useMemo(() => {
    const map = new Map<string, PartyRow>();
    for (const entry of importedEntries) {
      const name = entry.party_name || "Unknown";
      let row = map.get(name);
      if (!row) {
        row = { name, sales: 0, purchases: 0, salesCount: 0, purchasesCount: 0, total: 0 };
        map.set(name, row);
      }
      if (entry.bill_type === "sale") {
        row.sales += Number(entry.total);
        row.salesCount += 1;
      } else {
        row.purchases += Number(entry.total);
        row.purchasesCount += 1;
      }
      row.total = row.sales + row.purchases;
    }
    for (const inv of invoices) {
      const name = inv.buyer_name || "Unknown";
      let row = map.get(name);
      if (!row) {
        row = { name, sales: 0, purchases: 0, salesCount: 0, purchasesCount: 0, total: 0 };
        map.set(name, row);
      }
      row.sales += Number(inv.total);
      row.salesCount += 1;
      row.total = row.sales + row.purchases;
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);
  }, [importedEntries, invoices]);

  const detailEntries = useMemo(() => {
    let items: Array<{
      date: string;
      type: string;
      party: string;
      gross: number;
      gst: number;
      total: number;
      year: string;
    }> = [];

    for (const entry of importedEntries) {
      const gst = Number(entry.cgst_amount) + Number(entry.sgst_amount) + Number(entry.igst_amount);
      items.push({
        date: entry.invoice_date || "",
        type: entry.bill_type === "sale" ? "Sale" : "Purchase",
        party: entry.party_name || "Unknown",
        gross: Number(entry.subtotal),
        gst,
        total: Number(entry.total),
        year: entry.financial_year,
      });
    }

    for (const inv of invoices) {
      const gst = Number(inv.cgst_amount) + Number(inv.sgst_amount) + Number(inv.igst_amount);
      items.push({
        date: inv.date,
        type: "Sale (Invoice)",
        party: inv.buyer_name || "Unknown",
        gross: Number(inv.subtotal),
        gst,
        total: Number(inv.total),
        year: getFinancialYear(new Date(inv.date)),
      });
    }

    if (detailFilter) {
      const q = detailFilter.toLowerCase();
      items = items.filter(
        (i) =>
          i.party.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.year.includes(q),
      );
    }

    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [importedEntries, invoices, detailFilter]);

  const chartConfig = {
    sales: { label: "Sales", color: chartColors.sales },
    purchases: { label: "Purchases", color: chartColors.purchases },
    profit: { label: "Profit", color: chartColors.profit },
    gst: { label: "GST", color: chartColors.gst },
    netGst: { label: "Net GST", color: chartColors.netGst },
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sales, purchases, profit, and GST from imported data and invoices.
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

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Sales</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold">{formatCurrency(totals.sales)}</CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Purchases</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold">{formatCurrency(totals.purchases)}</CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Profit</CardTitle>
          </CardHeader>
          <CardContent className={`text-xl font-bold ${totals.profit >= 0 ? "" : "text-red-600"}`}>
            {formatCurrency(totals.profit)}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent className={`text-xl font-bold ${profitMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {profitMargin.toFixed(1)}%
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Net GST</CardTitle>
          </CardHeader>
          <CardContent className={`text-xl font-bold ${totals.netGst >= 0 ? "" : "text-emerald-600"}`}>
            {formatCurrency(totals.netGst)}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Sales vs Purchases</TabsTrigger>
          <TabsTrigger value="profit">Profit Trend</TabsTrigger>
          <TabsTrigger value="gst">GST Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Monthly Sales vs Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filtered}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="sales" fill={chartColors.sales} name="Sales" radius={4} />
                    <Bar dataKey="purchases" fill={chartColors.purchases} name="Purchases" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Monthly Profit & Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filtered}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => `${v.toFixed(0)}%`}
                    />
                    <Tooltip formatter={(value, name) =>
                        name === "profitMargin" ? `${Number(value).toFixed(1)}%` : formatCurrency(Number(value))
                      } />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="profit"
                      stroke={chartColors.profit}
                      strokeWidth={2.5}
                      name="Profit"
                      dot
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="profitMargin"
                      stroke="hsl(var(--chart-5))"
                      strokeWidth={2}
                      name="profitMargin"
                      dot={false}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Monthly GST (Sales vs Purchases)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filtered}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="salesGst" fill={chartColors.sales} name="GST on Sales" radius={4} />
                      <Bar dataKey="purchaseGst" fill={chartColors.purchases} name="GST on Purchases" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Net GST Liability (Output - Input)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filtered}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar
                        dataKey="netGst"
                        fill={chartColors.netGst}
                        name="Net GST Payable"
                        radius={4}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Year-over-Year Comparison */}
      {yearlyData.length > 1 && (
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Year-over-Year Comparison</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                  <TableHead className="text-right">GST (Sales)</TableHead>
                  <TableHead className="text-right">GST (Purchases)</TableHead>
                  <TableHead className="text-right">Net GST</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyData.map((row) => (
                  <TableRow key={row.year}>
                    <TableCell className="font-mono font-medium">{row.year}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(row.sales)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(row.purchases)}</TableCell>
                    <TableCell
                      className={`text-right font-mono ${row.profit >= 0 ? "" : "text-red-600"}`}
                    >
                      {formatCurrency(row.profit)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono ${row.profitMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {row.profitMargin.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(row.salesGst)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(row.purchaseGst)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(row.netGst)}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {row.salesCount + row.purchasesCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Party-wise Breakdown */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Top Parties (by volume)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Purchases</TableHead>
                <TableHead className="text-right">Total Volume</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partyData.map((row, i) => (
                <TableRow key={row.name}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium max-w-[250px] truncate">{row.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {row.sales > 0 ? formatCurrency(row.sales) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {row.purchases > 0 ? formatCurrency(row.purchases) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(row.total)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {row.salesCount + row.purchasesCount}
                  </TableCell>
                </TableRow>
              ))}
              {partyData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    No party data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Data Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">Detailed Transactions</CardTitle>
            <Input
              placeholder="Search by party, type, or year..."
              value={detailFilter}
              onChange={(e) => setDetailFilter(e.target.value)}
              className="h-8 w-64 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">GST</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailEntries.slice(0, 200).map((item, i) => (
                  <TableRow key={`${item.date}-${item.party}-${i}`}>
                    <TableCell className="font-mono text-xs">
                      {item.date ? format(new Date(item.date), "dd/MM/yy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.type === "Purchase" ? "secondary" : "default"}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.party}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(item.gross)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(item.gst)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.year}
                    </TableCell>
                  </TableRow>
                ))}
                {detailEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
                {detailEntries.length > 200 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground text-xs">
                      Showing 200 of {detailEntries.length} entries. Refine your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
