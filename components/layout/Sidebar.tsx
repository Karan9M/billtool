"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  Files,
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
      className="flex h-screen w-full flex-col bg-sidebar text-sidebar-foreground"
      style={{ position: "sticky", top: 0 }}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary shadow-sm">
          <Receipt className="size-5 text-sidebar-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">BillTool</div>
          <div className="text-[11px] text-sidebar-foreground/50">GST Invoicing</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3 pt-4">
        {NAV.map(({ href, label, icon: Icon, accent }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary" />
              )}
              <Icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} />
              {label}
              {accent && !active && (
                <span className="ml-auto flex size-2 rounded-full bg-sidebar-primary/60" />
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setShowFy((v) => !v)}
        className="mx-3 mb-1 flex items-center justify-between rounded-lg border border-sidebar-border/50 px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent/50"
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
