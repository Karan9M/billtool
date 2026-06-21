"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  companySettingsSchema,
  type CompanySettingsInput,
} from "@/lib/validators";
import type { CompanySettings } from "@/types/invoice";
import { CompanyTab } from "./CompanyTab";
import { BankTab } from "./BankTab";
import { InvoiceConfigTab } from "./InvoiceConfigTab";
import { BrandingTab } from "./BrandingTab";

interface Props {
  settings: CompanySettings;
}

export function SettingsTabs({ settings }: Props) {
  const [tab, setTab] = useState("company");
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(settings.logo_url);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(
    settings.signature_url
  );
  const [signatureScale, setSignatureScale] = useState(settings.signature_scale ?? 1);

  const form = useForm<CompanySettingsInput>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: settings.name,
      tagline: settings.tagline,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      pincode: settings.pincode,
      gst_number: settings.gst_number,
      phone: settings.phone,
      email: settings.email,
      bank_name: settings.bank_name,
      bank_branch: settings.bank_branch,
      account_number: settings.account_number,
      ifsc_code: settings.ifsc_code,
      invoice_prefix: settings.invoice_prefix,
      current_number: settings.current_number,
      terms: settings.terms,
    },
  });

  async function onSubmit(values: CompanySettingsInput) {
    setSaving(true);
    try {
      const sb = getSupabaseBrowser();
      const { error } = await sb
        .from("company_settings")
        .update(values)
        .eq("id", 1);
      if (error) throw error;
      toast.success("Settings saved");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignatureScaleChange(scale: number) {
    setSignatureScale(scale);
    try {
      const sb = getSupabaseBrowser();
      const { error } = await sb
        .from("company_settings")
        .update({ signature_scale: scale })
        .eq("id", 1);
      if (error) throw error;
      toast.success("Signature scale updated");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update failed";
      toast.error(msg);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="bank">Bank</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Config</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>
        <TabsContent value="company" className="mt-6">
          <CompanyTab form={form} />
        </TabsContent>
        <TabsContent value="bank" className="mt-6">
          <BankTab form={form} />
        </TabsContent>
        <TabsContent value="invoice" className="mt-6">
          <InvoiceConfigTab form={form} initialTemplate={settings.invoice_template} />
        </TabsContent>
        <TabsContent value="branding" className="mt-6">
          <BrandingTab
            logoUrl={logoUrl}
            signatureUrl={signatureUrl}
            signatureScale={signatureScale}
            onLogoChange={setLogoUrl}
            onSignatureChange={setSignatureUrl}
            onSignatureScaleChange={handleSignatureScaleChange}
          />
        </TabsContent>
      </Tabs>

      {tab !== "branding" ? (
        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            <Save className="size-4" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      ) : null}
    </motion.form>
  );
}
