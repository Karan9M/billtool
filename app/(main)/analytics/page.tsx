import { getSupabaseServer } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import type { ImportedLedgerEntry, Invoice } from "@/types/invoice";
import { isMissingTableError } from "@/lib/supabase/errors";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await getSupabaseServer();

  const [{ data: importedData, error: importedError }, { data: invoiceData, error: invoiceError }] =
    await Promise.all([
      supabase.from("imported_ledger_entries").select("*").order("invoice_date", { ascending: true }),
      supabase.from("invoices").select("*").order("date", { ascending: true }),
    ]);

  if (invoiceError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-3 text-sm text-destructive">
          Could not load analytics data: {invoiceError.message}
        </p>
      </div>
    );
  }

  const importedEntries = isMissingTableError(importedError)
    ? []
    : ((importedData ?? []) as ImportedLedgerEntry[]);
  const setupMessage = isMissingTableError(importedError)
    ? "Missing imported_ledger_entries table. Run supabase/schema.sql in Supabase SQL Editor, then reload."
    : undefined;

  if (importedError && !isMissingTableError(importedError)) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-3 text-sm text-destructive">
          Could not load imported ledger data: {importedError.message}
        </p>
      </div>
    );
  }

  return (
    <AnalyticsDashboard
      importedEntries={importedEntries}
      invoices={(invoiceData ?? []) as Invoice[]}
      setupMessage={setupMessage}
    />
  );
}
