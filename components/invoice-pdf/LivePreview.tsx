"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import type { CompanySettings } from "@/types/invoice";
import type { InvoicePDFData } from "./InvoicePDF";

const LivePreviewInner = dynamic(
  () => import("./LivePreviewInner").then((m) => m.LivePreviewInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Preparing preview…
      </div>
    ),
  }
);

interface Props {
  data: InvoicePDFData;
  company: CompanySettings;
  className?: string;
}

function LivePreviewComponent(props: Props) {
  return <LivePreviewInner signatureScale={props.company.signature_scale} {...props} />;
}

export const LivePreview = memo(LivePreviewComponent);
