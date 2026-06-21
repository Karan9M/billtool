import { getSupabaseServer } from "@/lib/supabase/server";
import type { Invoice } from "@/types/invoice";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-3 text-sm text-destructive">
          Could not load invoices: {error.message || String(error)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check that:
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>✓ <code className="font-mono">.env.local</code> has correct Supabase URL & key</li>
          <li>✓ You ran <code className="font-mono">supabase/schema.sql</code> in Supabase SQL editor</li>
          <li>✓ Your Supabase project is reachable from your network</li>
        </ul>
      </div>
    );
  }
  return <Dashboard invoices={(data ?? []) as Invoice[]} />;
}
