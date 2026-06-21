"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  Files,
  Settings,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFinancialYear } from "@/lib/invoice-utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices/new", label: "New Invoice", icon: FilePlus2, accent: true },
  { href: "/invoices", label: "All Invoices", icon: Files },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const fy = getFinancialYear();

  return (
    <div
      className="flex h-screen w-full flex-col bg-[#0f1829] text-white shadow-lg"
      style={{ position: "sticky", top: 0 }}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-blue-500">
          <Receipt className="size-5" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight">BillTool</div>
          <div className="text-[11px] text-white/50">GST Invoicing</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon, accent }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                accent && !active
                  ? "bg-blue-600/90 font-semibold text-white shadow hover:bg-blue-600"
                  : null,
                active
                  ? "bg-white/10 font-semibold text-white"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-wider text-white/40">
          Financial Year
        </div>
        <div className="mt-1 font-mono text-sm text-white">{fy}</div>
      </div>
    </div>
  );
}
