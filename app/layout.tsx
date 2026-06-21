import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BillTool — GST Invoicing",
  description:
    "GST-compliant tax invoice generator for SAI Communication System.",
  manifest: "/manifest.webmanifest",
  applicationName: "BillTool",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BillTool",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1829",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        outfit.variable,
        jetbrainsMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppShell>{children}</AppShell>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
