"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  Files,
  Upload,
  LineChart,
  Settings,
  Receipt,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFinancialYear } from "@/lib/invoice-utils";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices/new", label: "New Invoice", icon: FilePlus2, accent: true },
  { href: "/invoices", label: "Invoices", icon: Files },
  { href: "/imports", label: "Bulk Imports", icon: Upload },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const fy = getFinancialYear();
  const [showFy, setShowFy] = useState(false);
  const { user } = useAuth();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div
      className="flex h-screen w-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      style={{ position: "sticky", top: 0 }}
    >
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary shadow-[0_8px_18px_rgba(34,95,99,0.18)]">
          <Receipt className="size-5 text-sidebar-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-[0.95rem] font-semibold tracking-[-0.035em]">BillTool</div>
          <div className="mt-0.5 text-[11px] text-sidebar-foreground/50">GST invoicing</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {NAV.map(({ href, label, icon: Icon, accent }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150 active:scale-[0.985]",
                accent && !active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_6px_14px_rgba(34,95,99,0.16)] hover:bg-sidebar-primary/90"
                  : active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground"
              )}
            >
              {active && <span className="absolute left-1 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary" />}
              <Icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} />
              {label}
              {accent && !active && <FilePlus2 className="ml-auto size-3.5 opacity-75" />}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setShowFy((v) => !v)}
        className="mx-3 mb-2 flex items-center justify-between rounded-xl bg-secondary/55 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
            Financial Year
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-sidebar-foreground/60">
            {fy}
          </div>
        </div>
        {showFy ? (
          <ChevronUp className="size-3.5 text-sidebar-foreground/40" />
        ) : (
          <ChevronDown className="size-3.5 text-sidebar-foreground/40" />
        )}
      </button>

      {user && (
        <div className="border-t border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-3">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="size-8 rounded-full ring-2 ring-sidebar-border"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-primary/30 text-xs font-bold text-sidebar-foreground">
                {(user.email?.[0] || "?").toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-sidebar-foreground">
                {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
              </div>
              <div className="truncate text-[10px] text-sidebar-foreground/40">
                {user.email}
              </div>
            </div>
            <a
              href="/auth/signout"
              className="flex size-7 items-center justify-center rounded-md text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              title="Sign out"
            >
              <LogOut className="size-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
