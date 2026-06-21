import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BillTool — GST Invoicing",
    short_name: "BillTool",
    description:
      "GST-compliant tax invoice generator for SAI Communication System.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0f1829",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New Invoice",
        short_name: "New",
        description: "Create a new tax invoice",
        url: "/invoices/new",
      },
    ],
  };
}
