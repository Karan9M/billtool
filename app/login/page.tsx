"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const redirectPath = redirect?.startsWith("/") ? redirect : "/";
  const authError = searchParams.get("error");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(authError ?? "");

  async function handleGoogleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const sb = getSupabaseBrowser();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("redirect", redirectPath);

    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setError(error.message);
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

        <form onSubmit={handleGoogleSignIn} className="space-y-4">
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          <Button
            type="submit"
            disabled={busy}
            className="w-full h-11 text-sm font-medium shadow-xs"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Continue with Google"
            )}
          </Button>
        </form>
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
