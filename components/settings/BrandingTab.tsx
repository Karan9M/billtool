"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface Props {
  logoUrl: string | null;
  signatureUrl: string | null;
  signatureScale: number;
  onLogoChange: (url: string | null) => void;
  onSignatureChange: (url: string | null) => void;
  onSignatureScaleChange: (scale: number) => void;
}

export function BrandingTab({
  logoUrl,
  signatureUrl,
  signatureScale,
  onLogoChange,
  onSignatureChange,
  onSignatureScaleChange,
}: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <UploadCard
        title="Company Logo"
        description="Square PNG/JPG works best. Shown in the invoice header."
        url={logoUrl}
        field="logo_url"
        path="logo"
        onChange={onLogoChange}
      />
      <div className="space-y-6">
        <UploadCard
          title="Signature"
          description="Transparent PNG (~400×150 px). Appears above the Authorised Signatory line."
          url={signatureUrl}
          field="signature_url"
          path="signature"
          onChange={onSignatureChange}
          bg="bg-[length:20px_20px] bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%),linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%)] bg-[position:0_0,10px_10px]"
        />
        {signatureUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signature Scale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Adjust how large the signature appears in the invoice PDF.
              </p>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={signatureScale || 1}
                  onChange={(e) => onSignatureScaleChange(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0.5x</span>
                  <span className="font-medium">
                    {(signatureScale || 1).toFixed(1)}x
                  </span>
                  <span>2x</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Signature scale: <span className="font-mono">{(signatureScale || 1).toFixed(2)}</span>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function UploadCard({
  title,
  description,
  url,
  field,
  path,
  onChange,
  bg,
}: {
  title: string;
  description: string;
  url: string | null;
  field: "logo_url" | "signature_url";
  path: string;
  onChange: (url: string | null) => void;
  bg?: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;
    setBusy(true);
    try {
      const sb = getSupabaseBrowser();
      const ext = file.name.split(".").pop() || "png";
      const objectPath = `${path}-${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage
        .from("company-assets")
        .upload(objectPath, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = sb.storage
        .from("company-assets")
        .getPublicUrl(objectPath);
      const publicUrl = pub.publicUrl;

      const { error: dbErr } = await sb
        .from("company_settings")
        .update({ [field]: publicUrl })
        .eq("id", 1);
      if (dbErr) throw dbErr;

      onChange(publicUrl);
      toast.success(`${title} uploaded`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    try {
      const sb = getSupabaseBrowser();
      const { error } = await sb
        .from("company_settings")
        .update({ [field]: null })
        .eq("id", 1);
      if (error) throw error;
      onChange(null);
      toast.success(`${title} cleared`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Remove failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{description}</p>
        <div
          className={`flex h-44 w-full items-center justify-center overflow-hidden rounded-md border ${
            bg ?? "bg-muted/40"
          }`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={title}
              className="max-h-full max-w-full object-contain p-3"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageOff className="size-7" />
              <span className="text-xs">No image uploaded</span>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            size="lg"
          >
            <Upload className="size-4" />
            {url ? "Replace" : "Upload"}
          </Button>
          {url ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemove}
              disabled={busy}
              size="lg"
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
