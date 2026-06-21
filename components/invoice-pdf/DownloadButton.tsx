"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import type { CompanySettings } from "@/types/invoice";
import type { InvoicePDFData } from "./InvoicePDF";

const DownloadInner = dynamic(
  () => import("./DownloadInner").then((m) => m.DownloadInner),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground"
      >
        Loading…
      </button>
    ),
  }
);

interface Props {
  data: InvoicePDFData;
  company: CompanySettings;
  fileName?: string;
  label?: string;
  className?: string;
}

function DownloadButtonComponent(props: Props) {
  return <DownloadInner signatureScale={props.company.signature_scale} {...props} />;
}

export const DownloadButton = memo(DownloadButtonComponent);
