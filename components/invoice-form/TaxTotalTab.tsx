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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tax Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={taxType === "CGST_SGST" ? "default" : "outline"}
                onClick={() =>
                  setValue("tax_type", "CGST_SGST", { shouldDirty: true })
                }
              >
                CGST + SGST
              </Button>
              <Button
                type="button"
                variant={taxType === "IGST" ? "default" : "outline"}
                onClick={() =>
                  setValue("tax_type", "IGST", { shouldDirty: true })
                }
              >
                IGST
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              CGST + SGST for intra-state Gujarat sales · IGST for inter-state.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Tax Rate</Label>
            <Select
              value={String(taxRate)}
              onValueChange={(v) =>
                setValue("tax_rate", Number(v), { shouldDirty: true })
              }
            >
              <SelectTrigger className="h-10 w-full">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Totals</CardTitle>
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
          <div className="mt-2 flex items-center justify-between border-t pt-2">
            <span className="text-base font-bold">TOTAL</span>
            <span className="text-base font-bold text-blue-700">
              ₹{formatCurrencyPlain(totals.total)}
            </span>
          </div>
          <div className="mt-2 rounded-md bg-blue-50 p-2 text-xs text-blue-900">
            <span className="font-bold">In words:</span>{" "}
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
      <span>
        {sign}
        {formatCurrencyPlain(value)}
      </span>
    </div>
  );
}
