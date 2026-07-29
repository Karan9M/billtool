import { getSupabaseServer } from "@/lib/supabase/server";
import { ImportsPage } from "@/components/imports/ImportsPage";
import type { ImportedLedgerEntry } from "@/types/invoice";
import { isMissingTableError } from "@/lib/supabase/errors";

export const dynamic = "force-dynamic";

export default async function BulkImportsPage() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("imported_ledger_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (isMissingTableError(error)) {
    return (
      <ImportsPage
        entries={[]}
        setupMessage="Missing imported_ledger_entries table. Run supabase/schema.sql in Supabase SQL Editor, then reload."
      />
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Bulk Imports</h1>
        <p className="mt-3 text-sm text-destructive">
          Could not load imported entries: {error.message}
        </p>
      </div>
    );
  }

  return <ImportsPage entries={(data ?? []) as ImportedLedgerEntry[]} />;
}
