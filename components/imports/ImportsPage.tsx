"use client";

import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Upload, FileSpreadsheet, CalendarRange } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BillType, ImportedLedgerEntry } from "@/types/invoice";
import { formatCurrency } from "@/lib/invoice-utils";

interface Props {
  entries: ImportedLedgerEntry[];
  setupMessage?: string;
}

function isBillType(value: string): value is BillType {
  return value === "sale" || value === "purchase";
}

function getBillTypeLabel(type: BillType) {
  return type === "sale" ? "Sales" : "Purchases";
}

export function ImportsPage({ entries, setupMessage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [billType, setBillType] = useState<BillType>("sale");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const yearSummary = useMemo(() => {
    const map = new Map<
      string,
      { year: string; sales: number; purchases: number; salesCount: number; purchasesCount: number }
    >();

    for (const entry of entries) {
      const row = map.get(entry.financial_year) ?? {
        year: entry.financial_year,
        sales: 0,
        purchases: 0,
        salesCount: 0,
        purchasesCount: 0,
      };

      if (entry.bill_type === "sale") {
        row.sales += Number(entry.total);
        row.salesCount += 1;
      } else {
        row.purchases += Number(entry.total);
        row.purchasesCount += 1;
      }
      map.set(entry.financial_year, row);
    }

    return Array.from(map.values()).sort((a, b) => b.year.localeCompare(a.year));
  }, [entries]);

  const latestEntries = useMemo(() => entries.slice(0, 20), [entries]);

  async function handleUpload() {
    if (selectedFiles.length === 0) {
      toast.error("Select one or more .xlsx files first.");
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("billType", billType);
      for (const file of selectedFiles) formData.append("files", file);

      const response = await fetch("/api/imports/gst-xlsx", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        error?: string;
        inserted?: number;
        skippedFiles?: string[];
        years?: string[];
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Import failed");
      }

      toast.success(
        `Imported ${payload.inserted ?? 0} ${billType === "sale" ? "sales" : "purchase"} entries.`
      );

      if ((payload.skippedFiles?.length ?? 0) > 0) {
        toast.message(`Skipped: ${payload.skippedFiles?.join(", ")}`);
      }

      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      window.location.reload();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Bulk GST Imports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload old .xlsx GST bills in bulk and store them year-wise for analytics.
        </p>
      </header>

      {setupMessage ? (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {setupMessage}
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Upload XLSX bills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Bill Type</p>
                <Select
                  value={billType}
                  onValueChange={(value) => {
                    if (isBillType(value)) setBillType(value);
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sales Bills</SelectItem>
                    <SelectItem value="purchase">Purchase Bills</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">XLSX Files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
                  className="block h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Selected ({selectedFiles.length}):
                <div className="mt-1 space-y-1">
                  {selectedFiles.slice(0, 6).map((file) => (
                    <div key={file.name} className="truncate">
                      • {file.name}
                    </div>
                  ))}
                  {selectedFiles.length > 6 && (
                    <div>• +{selectedFiles.length - 6} more files</div>
                  )}
                </div>
              </div>
            )}

            <Button onClick={handleUpload} disabled={busy || selectedFiles.length === 0}>
              <Upload className="size-4" />
              {busy ? "Importing..." : "Import Files"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Import Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Entries</span>
              <span className="font-mono font-semibold">{entries.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sales Entries</span>
              <span className="font-mono font-semibold">
                {entries.filter((entry) => entry.bill_type === "sale").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Purchase Entries</span>
              <span className="font-mono font-semibold">
                {entries.filter((entry) => entry.bill_type === "purchase").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Year-wise Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {yearSummary.length === 0 ? (
              <p className="text-sm text-muted-foreground">No imported data yet.</p>
            ) : (
              <div className="space-y-2">
                {yearSummary.map((row) => (
                  <div
                    key={row.year}
                    className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarRange className="size-4 text-primary" />
                      <span className="font-mono">{row.year}</span>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-foreground">
                        Sales {formatCurrency(row.sales)} ({row.salesCount})
                      </div>
                      <div className="text-muted-foreground">
                        Purchases {formatCurrency(row.purchases)} ({row.purchasesCount})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Latest Imported Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {latestEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No imported bills yet.</p>
            ) : (
              <div className="space-y-2">
                {latestEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileSpreadsheet className="size-4 text-primary" />
                        <span className="truncate">{entry.invoice_no || entry.source_file}</span>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {getBillTypeLabel(entry.bill_type)} • {entry.party_name || "Unknown party"} •{" "}
                        {entry.invoice_date
                          ? format(new Date(entry.invoice_date), "dd MMM yyyy")
                          : "No date"}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-mono font-semibold text-foreground">
                        {formatCurrency(Number(entry.total))}
                      </div>
                      <div className="font-mono text-muted-foreground">{entry.financial_year}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
