import { getSupabaseServer } from "@/lib/supabase/server";
import type { CompanySettings } from "@/types/invoice";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-3 text-sm text-destructive">
          Could not load company settings: {error.message}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Did you run <code className="font-mono">supabase/schema.sql</code>?
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your company, banking, invoice numbering and branding.
        </p>
      </header>
      <SettingsTabs settings={data as CompanySettings} />
    </div>
  );
}
