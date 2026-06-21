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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    if (!confirm("Delete this invoice permanently? This cannot be undone."))
      return;
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

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col md:h-screen">
      {/* Top bar */}
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b bg-background px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-base font-bold tracking-tight">
                {invoice.invoice_no}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="text-xs text-muted-foreground">
              {invoice.buyer_name || "—"} ·{" "}
              {format(new Date(invoice.date), "dd MMM yyyy")}
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <DownloadButton data={previewData} company={company} />
        </div>
      </header>

      {/* Mobile pane toggle */}
      <div className="flex flex-shrink-0 items-center justify-center gap-1 border-b bg-muted/30 p-2 md:hidden">
        <Button
          type="button"
          size="sm"
          variant={pane === "meta" ? "default" : "ghost"}
          onClick={() => setPane("meta")}
        >
          <PenSquare className="size-4" /> Details
        </Button>
        <Button
          type="button"
          size="sm"
          variant={pane === "preview" ? "default" : "ghost"}
          onClick={() => setPane("preview")}
        >
          <Eye className="size-4" /> PDF
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* LEFT: meta + actions */}
        <motion.section
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className={`flex min-h-0 w-full flex-col overflow-y-auto border-r md:w-[380px] md:flex-shrink-0 ${
            pane === "meta" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="space-y-4 p-4">
            <Card>
              <CardContent className="space-y-2 p-4 text-sm">
                <Row k="Invoice No." v={invoice.invoice_no} mono />
                <Row k="Date" v={format(new Date(invoice.date), "dd MMM yyyy")} />
                <Row
                  k="Due Date"
                  v={
                    invoice.due_date
                      ? format(new Date(invoice.due_date), "dd MMM yyyy")
                      : "—"
                  }
                />
                <Row k="Status" v={<StatusBadge status={invoice.status} />} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-1 p-4 text-sm">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Bill To
                </div>
                <div className="text-base font-bold">
                  {invoice.buyer_name || "—"}
                </div>
                {invoice.buyer_address ? (
                  <div className="text-muted-foreground">
                    {invoice.buyer_address}
                  </div>
                ) : null}
                <div className="text-muted-foreground">
                  {[
                    invoice.buyer_city,
                    invoice.buyer_state,
                    invoice.buyer_pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                {invoice.buyer_gst ? (
                  <div className="font-mono text-xs">
                    GSTIN: {invoice.buyer_gst}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-1 p-4 font-mono text-sm">
                <Row k="Subtotal" v={formatCurrencyPlain(Number(invoice.subtotal))} mono />
                {invoice.tax_type === "CGST_SGST" ? (
                  <>
                    <Row
                      k={`CGST ${Number(invoice.cgst_rate).toFixed(1)}%`}
                      v={formatCurrencyPlain(Number(invoice.cgst_amount))}
                      mono
                    />
                    <Row
                      k={`SGST ${Number(invoice.sgst_rate).toFixed(1)}%`}
                      v={formatCurrencyPlain(Number(invoice.sgst_amount))}
                      mono
                    />
                  </>
                ) : (
                  <Row
                    k={`IGST ${Number(invoice.igst_rate).toFixed(1)}%`}
                    v={formatCurrencyPlain(Number(invoice.igst_amount))}
                    mono
                  />
                )}
                <Row
                  k="Round Off"
                  v={`${Number(invoice.round_off) >= 0 ? "+" : ""}${formatCurrencyPlain(
                    Number(invoice.round_off)
                  )}`}
                  mono
                />
                <div className="mt-1 flex items-center justify-between border-t pt-2 text-base font-bold">
                  <span>TOTAL</span>
                  <span className="text-blue-700">
                    {formatCurrency(Number(invoice.total))}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStatus("sent")}
                    disabled={busy || invoice.status === "sent"}
                  >
                    <Send className="size-4" /> Mark Sent
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setStatus("paid")}
                    disabled={busy || invoice.status === "paid"}
                  >
                    <CheckCircle2 className="size-4" /> Mark Paid
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setStatus("cancelled")}
                    disabled={busy || invoice.status === "cancelled"}
                  >
                    <XCircle className="size-4" /> Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={busy}
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
                <div className="pt-2 md:hidden">
                  <DownloadButton
                    data={previewData}
                    company={company}
                    className="w-full justify-center"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* RIGHT: PDF preview */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={`flex min-h-0 flex-1 flex-col bg-muted/20 ${
            pane === "preview" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="min-h-0 flex-1 p-2 md:p-4">
            <LivePreview data={previewData} company={company} />
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  mono,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className={mono ? "font-mono" : ""}>{v}</span>
    </div>
  );
}
