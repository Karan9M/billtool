import { getSupabaseServer } from "@/lib/supabase/server";
import type { Invoice } from "@/types/invoice";
import { InvoicesList } from "@/components/invoices-list/InvoicesList";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">All Invoices</h1>
        <p className="mt-3 text-sm text-destructive">
          Could not load invoices: {error.message}
        </p>
      </div>
    );
  }
  return <InvoicesList initial={(data ?? []) as Invoice[]} />;
}
