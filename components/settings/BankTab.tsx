"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UseFormReturn } from "react-hook-form";
import type { CompanySettingsInput } from "@/lib/validators";
import { TextField } from "./fields";

export function BankTab({
  form,
}: {
  form: UseFormReturn<CompanySettingsInput>;
}) {
  const { register, formState } = form;
  const errors = formState.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="bank_name"
            label="Bank Name"
            register={register}
            errors={errors}
          />
          <TextField
            name="bank_branch"
            label="Branch"
            register={register}
            errors={errors}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="account_number"
            label="Account Number"
            register={register}
            errors={errors}
            inputClassName="font-mono"
          />
          <TextField
            name="ifsc_code"
            label="IFSC Code"
            register={register}
            errors={errors}
            inputClassName="font-mono"
          />
        </div>
      </CardContent>
    </Card>
  );
}
