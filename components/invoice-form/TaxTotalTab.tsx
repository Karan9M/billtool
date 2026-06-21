"use client";

import type { UseFormReturn } from "react-hook-form";
import type { InvoiceFormInput } from "@/lib/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TAX_RATE_OPTIONS } from "@/lib/quick-fill-items";
import {
  formatCurrencyPlain,
  numberToWords,
} from "@/lib/invoice-utils";
import type { InvoiceTotals } from "@/types/invoice";

export function TaxTotalTab({
  form,
  totals,
}: {
  form: UseFormReturn<InvoiceFormInput>;
  totals: InvoiceTotals;
}) {
  const { watch, setValue } = form;
  const taxType = watch("tax_type");
  const taxRate = Number(watch("tax_rate") || 0);

  return (
    <div className="space-y-4">
      <Card className="border-0 bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground">
            Tax Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tax Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={taxType === "CGST_SGST" ? "default" : "outline"}
                onClick={() =>
                  setValue("tax_type", "CGST_SGST", { shouldDirty: true })
                }
                className="h-9 text-xs shadow-xs"
              >
                CGST + SGST
              </Button>
              <Button
                type="button"
                variant={taxType === "IGST" ? "default" : "outline"}
                onClick={() =>
                  setValue("tax_type", "IGST", { shouldDirty: true })
                }
                className="h-9 text-xs"
              >
                IGST
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              CGST + SGST for intra-state (Gujarat) &middot; IGST for inter-state.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tax Rate</Label>
            <Select
              value={String(taxRate)}
              onValueChange={(v) =>
                setValue("tax_rate", Number(v), { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAX_RATE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground">
            Totals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 font-mono text-sm">
          <Row label="Subtotal" value={totals.subtotal} />
          {taxType === "CGST_SGST" ? (
            <>
              <Row
                label={`CGST ${(taxRate / 2).toFixed(1)}%`}
                value={totals.cgst}
              />
              <Row
                label={`SGST ${(taxRate / 2).toFixed(1)}%`}
                value={totals.sgst}
              />
            </>
          ) : (
            <Row label={`IGST ${taxRate.toFixed(1)}%`} value={totals.igst} />
          )}
          <Row
            label="Round Off"
            value={totals.roundOff}
            sign={totals.roundOff >= 0 ? "+" : ""}
          />
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
            <span className="text-base font-bold text-foreground">TOTAL</span>
            <span className="text-base font-bold text-primary">
              ₹{formatCurrencyPlain(totals.total)}
            </span>
          </div>
          <div className="mt-3 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">In words:</span>{" "}
            {numberToWords(totals.total)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  sign,
}: {
  label: string;
  value: number;
  sign?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">
        {sign}{formatCurrencyPlain(value)}
      </span>
    </div>
  );
}
