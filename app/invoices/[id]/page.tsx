import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { CompanySettings, Invoice } from "@/types/invoice";
import { InvoiceDetail } from "@/components/invoice-detail/InvoiceDetail";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServer();
  const [{ data: inv, error: invErr }, { data: settings }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).single(),
    supabase.from("company_settings").select("*").eq("id", 1).single(),
  ]);

  if (invErr || !inv || !settings) notFound();

  return (
    <InvoiceDetail
      invoice={inv as Invoice}
      company={settings as CompanySettings}
    />
  );
}
