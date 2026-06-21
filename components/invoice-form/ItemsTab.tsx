"use client";

import type { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import type { InvoiceFormInput } from "@/lib/validators";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { QUICK_FILL_ITEMS, UNIT_OPTIONS } from "@/lib/quick-fill-items";
import { formatCurrencyPlain } from "@/lib/invoice-utils";

interface Props {
  form: UseFormReturn<InvoiceFormInput>;
  itemsField: UseFieldArrayReturn<InvoiceFormInput, "items">;
}

export function ItemsTab({ form, itemsField }: Props) {
  const { register, watch, setValue } = form;
  const { fields, append, remove } = itemsField;
  const items = watch("items");

  function addEmpty() {
    append({
      id: uuidv4(),
      description: "",
      hsn_code: "",
      quantity: 1,
      unit: "Nos",
      rate: 0,
      amount: 0,
    });
  }

  function applyQuickFill(idx: number, label: string) {
    const preset = QUICK_FILL_ITEMS.find((p) => p.label === label);
    if (!preset) return;
    setValue(`items.${idx}.description`, preset.description, {
      shouldDirty: true,
    });
    setValue(`items.${idx}.hsn_code`, preset.hsn_code, { shouldDirty: true });
    setValue(`items.${idx}.unit`, preset.unit, { shouldDirty: true });
    setValue(`items.${idx}.rate`, preset.default_rate, { shouldDirty: true });
    const q = Number(form.getValues(`items.${idx}.quantity`) || 1);
    setValue(`items.${idx}.amount`, q * preset.default_rate, {
      shouldDirty: true,
    });
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {fields.map((f, i) => {
          const amount = items?.[i]?.amount ?? 0;
          return (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <Card>
                <CardContent className="space-y-3 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Item #{i + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" size="xs" variant="outline">
                            <Sparkles className="size-3" /> Quick Fill
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          {QUICK_FILL_ITEMS.map((p) => (
                            <DropdownMenuItem
                              key={p.label}
                              onClick={() => applyQuickFill(i, p.label)}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm">{p.label}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  HSN {p.hsn_code} · ₹
                                  {formatCurrencyPlain(p.default_rate)}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => fields.length > 1 && remove(i)}
                        disabled={fields.length <= 1}
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`items.${i}.description`}>
                      Description
                    </Label>
                    <Input
                      id={`items.${i}.description`}
                      className="h-10"
                      {...register(`items.${i}.description` as const)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`items.${i}.hsn_code`}>HSN/SAC</Label>
                      <Input
                        id={`items.${i}.hsn_code`}
                        className="h-10 font-mono"
                        {...register(`items.${i}.hsn_code` as const)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Unit</Label>
                      <Select
                        value={watch(`items.${i}.unit`) || "Nos"}
                        onValueChange={(v) =>
                          setValue(`items.${i}.unit`, v, { shouldDirty: true })
                        }
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`items.${i}.quantity`}>Qty</Label>
                      <Input
                        id={`items.${i}.quantity`}
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-10"
                        {...register(`items.${i}.quantity` as const, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`items.${i}.rate`}>Rate (₹)</Label>
                      <Input
                        id={`items.${i}.rate`}
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-10"
                        {...register(`items.${i}.rate` as const, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Amount</Label>
                      <div className="flex h-10 items-center justify-end rounded-lg border bg-muted/40 px-2.5 font-mono text-sm">
                        ₹{formatCurrencyPlain(Number(amount || 0))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={addEmpty}
        className="w-full"
      >
        <Plus className="size-4" />
        Add Item
      </Button>
    </div>
  );
}
