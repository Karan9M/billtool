"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  Send,
  Trash2,
  XCircle,
  Eye,
  PenSquare,
  Download,
  MoreHorizontal,
  Building2,
  Calendar,
  Hash,
  IndianRupee,
  ChevronRight,
  Receipt,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/StatusBadge";
import { LivePreview } from "@/components/invoice-pdf/LivePreview";
import { DownloadButton } from "@/components/invoice-pdf/DownloadButton";

import type { CompanySettings, Invoice, InvoiceStatus } from "@/types/invoice";
import { formatCurrency, formatCurrencyPlain } from "@/lib/invoice-utils";

interface Props {
  invoice: Invoice;
  company: CompanySettings;
}

export function InvoiceDetail({ invoice: initial, company }: Props) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [pane, setPane] = useState<"meta" | "preview">("meta");

  async function setStatus(status: InvoiceStatus) {
    setBusy(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setInvoice({ ...invoice, status });
      toast.success(`Marked as ${status}`);
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this invoice permanently? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast.success("Invoice deleted");
      router.push("/invoices");
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const previewData = {
    invoice_no: invoice.invoice_no,
    date: invoice.date,
    due_date: invoice.due_date ?? "",
    buyer_name: invoice.buyer_name,
    buyer_address: invoice.buyer_address,
    buyer_city: invoice.buyer_city,
    buyer_state: invoice.buyer_state,
    buyer_pincode: invoice.buyer_pincode,
    buyer_gst: invoice.buyer_gst,
    buyer_phone: invoice.buyer_phone,
    buyer_email: invoice.buyer_email,
    items: invoice.items,
    tax_type: invoice.tax_type,
    tax_rate:
      invoice.tax_type === "CGST_SGST"
        ? Number(invoice.cgst_rate) + Number(invoice.sgst_rate)
        : Number(invoice.igst_rate),
    notes: invoice.notes,
    delivery_note: invoice.delivery_note,
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col md:h-screen">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/invoices"
            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="font-mono text-base font-bold tracking-tight text-foreground truncate">
                {invoice.invoice_no}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {invoice.buyer_name || "—"} &middot;{" "}
              {format(new Date(invoice.date), "dd MMM yyyy")}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <DownloadButton data={previewData} company={company} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={busy}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setStatus("sent")} disabled={busy || invoice.status === "sent"}>
                <Send className="size-3.5" /> Mark Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("paid")} disabled={busy || invoice.status === "paid"}>
                <CheckCircle2 className="size-3.5" /> Mark Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("cancelled")} disabled={busy || invoice.status === "cancelled"}>
                <XCircle className="size-3.5" /> Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={busy}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <DownloadButton data={previewData} company={company} />
        </div>
      </header>

      {/* Mobile pane toggle */}
      <div className="flex shrink-0 items-center justify-center gap-1 border-b bg-muted/30 px-4 py-2 md:hidden">
        <Button
          type="button"
          size="sm"
          variant={pane === "meta" ? "default" : "ghost"}
          onClick={() => setPane("meta")}
          className="h-8 text-xs"
        >
          <Receipt className="size-3.5" /> Details
        </Button>
        <Button
          type="button"
          size="sm"
          variant={pane === "preview" ? "default" : "ghost"}
          onClick={() => setPane("preview")}
          className="h-8 text-xs"
        >
          <Eye className="size-3.5" /> PDF Preview
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* LEFT: meta + actions */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className={`flex min-h-0 w-full flex-col overflow-y-auto border-r md:w-[380px] md:shrink-0 ${
            pane === "meta" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="space-y-3 p-4">
            {/* Info card */}
            <motion.div variants={itemAnim}>
              <Card className="border-0 bg-card shadow-sm">
                <CardContent className="divide-y divide-border/50 p-0">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Hash className="size-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Invoice No.
                      </div>
                      <div className="font-mono text-sm font-semibold text-foreground truncate">
                        {invoice.invoice_no}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </div>
                      <div className="text-sm text-foreground">
                        {format(new Date(invoice.date), "dd MMM yyyy")}
                      </div>
                    </div>
                    {invoice.due_date && (
                      <div className="text-right">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Due
                        </div>
                        <div className="text-sm text-foreground">
                          {format(new Date(invoice.due_date), "dd MMM yyyy")}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <IndianRupee className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Total Amount
                      </div>
                      <div className="font-mono text-lg font-bold text-foreground">
                        {formatCurrency(Number(invoice.total))}
                      </div>
                    </div>
                    <StatusBadge status={invoice.status} size="lg" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bill To card */}
            <motion.div variants={itemAnim}>
              <Card className="border-0 bg-card shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Bill To
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground">
                      {invoice.buyer_name || "—"}
                    </div>
                    {invoice.buyer_address && (
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {invoice.buyer_address}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {[invoice.buyer_city, invoice.buyer_state, invoice.buyer_pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    {invoice.buyer_gst && (
                      <div className="pt-1 font-mono text-[11px] text-muted-foreground">
                        GSTIN: <span className="text-foreground">{invoice.buyer_gst}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Totals card */}
            <motion.div variants={itemAnim}>
              <Card className="border-0 bg-card shadow-sm">
                <CardContent className="space-y-1.5 p-4 font-mono text-sm">
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Tax Breakup
                    </span>
                  </div>
                  <Row k="Subtotal" v={formatCurrencyPlain(Number(invoice.subtotal))} />
                  {invoice.tax_type === "CGST_SGST" ? (
                    <>
                      <Row
                        k={`CGST ${Number(invoice.cgst_rate).toFixed(1)}%`}
                        v={formatCurrencyPlain(Number(invoice.cgst_amount))}
                      />
                      <Row
                        k={`SGST ${Number(invoice.sgst_rate).toFixed(1)}%`}
                        v={formatCurrencyPlain(Number(invoice.sgst_amount))}
                      />
                    </>
                  ) : (
                    <Row
                      k={`IGST ${Number(invoice.igst_rate).toFixed(1)}%`}
                      v={formatCurrencyPlain(Number(invoice.igst_amount))}
                    />
                  )}
                  <Row
                    k="Round Off"
                    v={`${Number(invoice.round_off) >= 0 ? "+" : ""}${formatCurrencyPlain(
                      Number(invoice.round_off)
                    )}`}
                  />
                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                    <span className="text-base font-bold text-foreground">TOTAL</span>
                    <span className="text-base font-bold text-primary">
                      {formatCurrency(Number(invoice.total))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick actions (mobile) */}
            <motion.div variants={itemAnim} className="md:hidden">
              <Card className="border-0 bg-card shadow-sm">
                <CardContent className="space-y-2 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStatus("sent")}
                      disabled={busy || invoice.status === "sent"}
                      className="h-9 text-xs"
                    >
                      <Send className="size-3.5" /> Sent
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setStatus("paid")}
                      disabled={busy || invoice.status === "paid"}
                      className="h-9 text-xs"
                    >
                      <CheckCircle2 className="size-3.5" /> Paid
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStatus("cancelled")}
                      disabled={busy || invoice.status === "cancelled"}
                      className="h-9 text-xs"
                    >
                      <XCircle className="size-3.5" /> Cancel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      disabled={busy}
                      className="h-9 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* RIGHT: PDF preview */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className={`flex min-h-0 flex-1 flex-col bg-muted/30 ${
            pane === "preview" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b bg-background/80 px-4 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="size-3.5" />
              PDF Preview &middot; A4
            </div>
            <DownloadButton data={previewData} company={company} />
          </div>
          <div className="min-h-0 flex-1 p-2 md:p-4">
            <LivePreview data={previewData} company={company} />
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}
