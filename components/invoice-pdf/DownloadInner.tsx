"use client";

import { memo } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanySettings } from "@/types/invoice";
import { InvoicePDF, type InvoicePDFData } from "./InvoicePDF";

interface Props {
  data: InvoicePDFData;
  company: CompanySettings;
  fileName?: string;
  label?: string;
  className?: string;
  signatureScale?: number;
}

function DownloadInnerComponent({
  data,
  company,
  fileName,
  label = "Download PDF",
  className,
  signatureScale,
}: Props) {
  const safeName = (fileName ?? `${data.invoice_no || "invoice"}.pdf`).replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  return (
    <PDFDownloadLink
      document={<InvoicePDF data={data} company={company} signatureScale={signatureScale} />}
      fileName={safeName}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90",
        className
      )}
    >
      {({ loading }) => (
        <>
          <Download className="size-4" />
          {loading ? "Preparing…" : label}
        </>
      )}
    </PDFDownloadLink>
  );
}

export const DownloadInner = memo(DownloadInnerComponent);
