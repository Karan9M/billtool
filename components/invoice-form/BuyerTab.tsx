"use client";

import type { UseFormReturn } from "react-hook-form";
import type { InvoiceFormInput } from "@/lib/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormTextArea } from "./fields";

export function BuyerTab({
  form,
}: {
  form: UseFormReturn<InvoiceFormInput>;
}) {
  const { register, formState } = form;
  const errors = formState.errors;
  return (
    <div className="space-y-4">
      <Card className="border-0 bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground">
            Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <FormField
            name="invoice_no"
            label="Invoice No."
            register={register}
            errors={errors}
            inputClassName="font-mono"
          />
          <FormField
            name="date"
            label="Date"
            type="date"
            register={register}
            errors={errors}
          />
          <FormField
            name="due_date"
            label="Due Date"
            type="date"
            register={register}
            errors={errors}
            className="sm:col-span-2"
          />
        </CardContent>
      </Card>

      <Card className="border-0 bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground">
            Buyer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FormField
            name="buyer_name"
            label="Name *"
            register={register}
            errors={errors}
          />
          <FormTextArea
            name="buyer_address"
            label="Address"
            register={register}
            errors={errors}
            rows={2}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              name="buyer_city"
              label="City"
              register={register}
              errors={errors}
            />
            <FormField
              name="buyer_state"
              label="State"
              register={register}
              errors={errors}
            />
            <FormField
              name="buyer_pincode"
              label="Pincode"
              register={register}
              errors={errors}
            />
          </div>
          <FormField
            name="buyer_gst"
            label="GSTIN"
            register={register}
            errors={errors}
            inputClassName="font-mono uppercase"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              name="buyer_phone"
              label="Phone"
              register={register}
              errors={errors}
            />
            <FormField
              name="buyer_email"
              label="Email"
              type="email"
              register={register}
              errors={errors}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
