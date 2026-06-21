"use client";

import type { UseFormReturn } from "react-hook-form";
import type { InvoiceFormInput } from "@/lib/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormTextArea } from "./fields";

export function NotesTab({
  form,
}: {
  form: UseFormReturn<InvoiceFormInput>;
}) {
  const { register, formState } = form;
  const errors = formState.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notes & Delivery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormTextArea
          name="notes"
          label="Notes"
          register={register}
          errors={errors}
          rows={4}
          placeholder="Internal notes — appears in the bottom-left of the invoice."
        />
        <FormTextArea
          name="delivery_note"
          label="Delivery Note"
          register={register}
          errors={errors}
          rows={3}
          placeholder="Despatch / delivery info."
        />
      </CardContent>
    </Card>
  );
}
