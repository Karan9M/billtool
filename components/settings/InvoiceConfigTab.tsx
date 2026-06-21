"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";
import type { CompanySettingsInput } from "@/lib/validators";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { TextField, TextAreaField } from "./fields";

const TEMPLATES = [
  { value: "modern", label: "Modern (Blue)" },
  { value: "classic", label: "Classic (Gray)" },
  { value: "minimal", label: "Minimal (Clean)" },
];

interface Props {
  form: UseFormReturn<CompanySettingsInput>;
  initialTemplate?: string;
}

export function InvoiceConfigTab({
  form,
  initialTemplate = "modern",
}: Props) {
  const { register, formState } = form;
  const errors = formState.errors;
  const [template, setTemplate] = useState(initialTemplate);
  const [saving, setSaving] = useState(false);

  async function handleTemplateChange(value: string) {
    setTemplate(value);
    setSaving(true);
    try {
      const sb = getSupabaseBrowser();
      const { error } = await sb
        .from("company_settings")
        .update({ invoice_template: value })
        .eq("id", 1);
      if (error) throw error;
      toast.success("Invoice template updated");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Choose the design template for your invoices.
          </p>
          <Select value={template} onValueChange={handleTemplateChange} disabled={saving}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Numbering & Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="invoice_prefix"
              label="Invoice Prefix"
              register={register}
              errors={errors}
              placeholder="GST"
              inputClassName="font-mono"
            />
            <TextField
              name="current_number"
              label="Last Issued Number"
              type="number"
              register={register}
              errors={errors}
              inputClassName="font-mono"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Next invoice number will be one greater than this. Format:{" "}
            <span className="font-mono">PREFIX-NNN-YYYY-YYYY</span>
          </p>
          <TextAreaField
            name="terms"
            label="Terms & Conditions"
            register={register}
            errors={errors}
            rows={6}
          />
        </CardContent>
      </Card>
    </div>
  );
}
