import { getSupabaseServer } from "@/lib/supabase/server";
import type { CompanySettings } from "@/types/invoice";
import { generateInvoiceNumber, getFinancialYear } from "@/lib/invoice-utils";
import { InvoiceForm } from "@/components/invoice-form/InvoiceForm";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">New Invoice</h1>
        <p className="mt-3 text-sm text-destructive">
          Could not load company settings. Run{" "}
          <code className="font-mono">supabase/schema.sql</code> first.
        </p>
      </div>
    );
  }

  const company = data as CompanySettings;
  const proposedNumber = generateInvoiceNumber(
    company.invoice_prefix,
    company.current_number + 1,
    getFinancialYear()
  );

  const today = format(new Date(), "yyyy-MM-dd");
  const dueDate = format(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd"
  );

  return (
    <InvoiceForm
      company={company}
      proposedNumber={proposedNumber}
      defaultDate={today}
      defaultDueDate={dueDate}
    />
  );
}
