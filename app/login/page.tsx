"use client";

import { Suspense, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { LogIn, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const [busy, setBusy] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function signInWithGoogle() {
    setBusy(true);
    const sb = getSupabaseBrowser();
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) {
      console.error(error);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
            <Receipt className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            BillTool
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your GST invoices
          </p>
        </div>

        <Button
          onClick={signInWithGoogle}
          disabled={busy}
          className="w-full h-11 gap-3 text-sm font-medium shadow-xs"
        >
          <LogIn className="size-5" />
          {busy ? "Redirecting..." : "Sign in with Google"}
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          GST-compliant invoicing for SAI Communication System
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
