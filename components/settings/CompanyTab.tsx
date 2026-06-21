"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UseFormReturn } from "react-hook-form";
import type { CompanySettingsInput } from "@/lib/validators";
import { TextField, TextAreaField } from "./fields";

export function CompanyTab({
  form,
}: {
  form: UseFormReturn<CompanySettingsInput>;
}) {
  const { register, formState } = form;
  const errors = formState.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="name"
            label="Company Name"
            register={register}
            errors={errors}
          />
          <TextField
            name="tagline"
            label="Tagline"
            register={register}
            errors={errors}
          />
        </div>
        <TextAreaField
          name="address"
          label="Address"
          register={register}
          errors={errors}
          rows={2}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            name="city"
            label="City"
            register={register}
            errors={errors}
          />
          <TextField
            name="state"
            label="State"
            register={register}
            errors={errors}
          />
          <TextField
            name="pincode"
            label="Pincode"
            register={register}
            errors={errors}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            name="gst_number"
            label="GSTIN"
            register={register}
            errors={errors}
            inputClassName="font-mono"
          />
          <TextField
            name="phone"
            label="Phone"
            register={register}
            errors={errors}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            register={register}
            errors={errors}
          />
        </div>
      </CardContent>
    </Card>
  );
}
