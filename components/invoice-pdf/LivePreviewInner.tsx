"use client";

import { memo } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import type { CompanySettings } from "@/types/invoice";
import { InvoicePDF, type InvoicePDFData } from "./InvoicePDF";

interface Props {
  data: InvoicePDFData;
  company: CompanySettings;
  className?: string;
  signatureScale?: number;
}

function LivePreviewInnerComponent({ data, company, className, signatureScale }: Props) {
  return (
    <div
      className={
        className ?? "h-full w-full overflow-hidden rounded-md border bg-white"
      }
    >
      <PDFViewer
        showToolbar={false}
        style={{ width: "100%", height: "100%", border: 0 }}
      >
        <InvoicePDF data={data} company={company} signatureScale={signatureScale} />
      </PDFViewer>
    </div>
  );
}

export const LivePreviewInner = memo(LivePreviewInnerComponent);
