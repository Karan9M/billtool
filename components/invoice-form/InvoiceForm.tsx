"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  CircleDot,
  Eye,
  PenSquare,
  Save,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  invoiceFormSchema,
  type InvoiceFormInput,
} from "@/lib/validators";
import { calculateTotals } from "@/lib/invoice-utils";
import type { CompanySettings } from "@/types/invoice";

import { BuyerTab } from "./BuyerTab";
import { ItemsTab } from "./ItemsTab";
import { TaxTotalTab } from "./TaxTotalTab";
import { NotesTab } from "./NotesTab";
import { LivePreview } from "@/components/invoice-pdf/LivePreview";
import { DownloadButton } from "@/components/invoice-pdf/DownloadButton";

interface Props {
  company: CompanySettings;
  proposedNumber: string;
  defaultDate: string;
  defaultDueDate: string;
}

export function InvoiceForm({
  company,
  proposedNumber,
  defaultDate,
  defaultDueDate,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState("buyer");
  const [mobilePane, setMobilePane] = useState<"form" | "preview">("form");
  const [submitting, setSubmitting] = useState(false);
  const [manuallyCachedPreview, setManuallyCachedPreview] = useState<InvoiceFormInput | null>(null);

  const form = useForm<InvoiceFormInput>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoice_no: proposedNumber,
      date: defaultDate,
      due_date: defaultDueDate,
      buyer_name: "",
      buyer_address: "",
      buyer_city: "",
      buyer_state: "Gujarat",
      buyer_pincode: "",
      buyer_gst: "",
      buyer_phone: "",
      buyer_email: "",
      items: [
        {
          id: uuidv4(),
          description: "",
          hsn_code: "",
          quantity: 1,
          unit: "Nos",
          rate: 0,
          amount: 0,
        },
      ],
      tax_type: "CGST_SGST",
      tax_rate: 18,
      notes: "",
      delivery_note: "",
    },
  });

  const itemsField = useFieldArray({ control: form.control, name: "items" });

  const watched = form.watch();

  // Recompute item amounts whenever quantity/rate changes
  useEffect(() => {
    const sub = form.watch((value, info) => {
      if (!info.name) return;
      const m = info.name.match(/^items\.(\d+)\.(quantity|rate)$/);
      if (m) {
        const idx = Number(m[1]);
        const q = Number(value.items?.[idx]?.quantity ?? 0);
        const r = Number(value.items?.[idx]?.rate ?? 0);
        const amount = Math.round(q * r * 100) / 100;
        const current = form.getValues(`items.${idx}.amount`);
        if (current !== amount) {
          form.setValue(`items.${idx}.amount`, amount, {
            shouldDirty: true,
            shouldValidate: false,
          });
        }
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  // Manual preview - only update when user clicks "Update Preview" button
  const previewData = useMemo(() => {
    const source = manuallyCachedPreview || watched;
    const items = (source.items || []).map((it) => ({
      id: it.id,
      description: it.description || "",
      hsn_code: it.hsn_code || "",
      quantity: Number(it.quantity || 0),
      unit: it.unit || "Nos",
      rate: Number(it.rate || 0),
      amount:
        Number(it.amount || 0) ||
        Math.round(Number(it.quantity || 0) * Number(it.rate || 0) * 100) / 100,
    }));
    return {
      invoice_no: source.invoice_no || proposedNumber,
      date: source.date || defaultDate,
      due_date: source.due_date || "",
      buyer_name: source.buyer_name || "",
      buyer_address: source.buyer_address || "",
      buyer_city: source.buyer_city || "",
      buyer_state: source.buyer_state || "",
      buyer_pincode: source.buyer_pincode || "",
      buyer_gst: source.buyer_gst || "",
      buyer_phone: source.buyer_phone || "",
      buyer_email: source.buyer_email || "",
      items,
      tax_type: source.tax_type || "CGST_SGST",
      tax_rate: Number(source.tax_rate || 0),
      notes: source.notes || "",
      delivery_note: source.delivery_note || "",
    };
  }, [manuallyCachedPreview, watched, proposedNumber, defaultDate]);

  async function onSubmit(values: InvoiceFormInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        throw new Error(json.error || "Could not save invoice");
      }
      toast.success("Invoice created");
      router.push(`/invoices/${json.id}`);
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col md:h-screen">
      {/* Top bar */}
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-base font-semibold leading-tight">
              New Invoice
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              {watched.invoice_no || proposedNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setManuallyCachedPreview(watched)}
            size="sm"
          >
            Update Preview
          </Button>
          <DownloadButton data={previewData} company={company} />
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={submitting}
            size="lg"
          >
            <Save className="size-4" />
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </header>

      {/* Mobile pane toggle */}
      <div className="flex flex-shrink-0 items-center justify-center gap-1 border-b bg-muted/30 p-2 md:hidden">
        <Button
          type="button"
          size="sm"
          variant={mobilePane === "form" ? "default" : "ghost"}
          onClick={() => setMobilePane("form")}
        >
          <PenSquare className="size-4" /> Form
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mobilePane === "preview" ? "default" : "ghost"}
          onClick={() => setMobilePane("preview")}
        >
          <Eye className="size-4" /> Preview
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* LEFT: form */}
        <motion.section
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className={`flex min-h-0 w-full flex-col overflow-y-auto border-r md:w-[420px] md:flex-shrink-0 ${
            mobilePane === "form" ? "block" : "hidden md:flex"
          }`}
        >
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Tabs
              value={tab}
              onValueChange={setTab}
              className="flex flex-1 flex-col"
            >
              <div className="border-b bg-background px-3 pt-3">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="buyer">Buyer</TabsTrigger>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="tax">Tax</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <TabsContent value="buyer" className="m-0">
                  <BuyerTab form={form} />
                </TabsContent>
                <TabsContent value="items" className="m-0">
                  <ItemsTab form={form} itemsField={itemsField} />
                </TabsContent>
                <TabsContent value="tax" className="m-0">
                  <TaxTotalTab
                    form={form}
                    totals={calculateTotals(
                      previewData.items,
                      previewData.tax_type,
                      previewData.tax_rate
                    )}
                  />
                </TabsContent>
                <TabsContent value="notes" className="m-0">
                  <NotesTab form={form} />
                </TabsContent>
              </div>
            </Tabs>
          </form>
        </motion.section>

        {/* RIGHT: preview */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={`flex min-h-0 flex-1 flex-col bg-muted/20 ${
            mobilePane === "preview" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 py-2 backdrop-blur">
            <div className="text-xs text-muted-foreground">
              Preview · A4
            </div>
          </div>
          <div className="min-h-0 flex-1 p-2 md:p-4">
            <LivePreview data={previewData} company={company} />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
