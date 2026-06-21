"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const sb = getSupabaseBrowser();

    if (mode === "signin") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      router.push(redirect);
      router.refresh();
    } else {
      const { error } = await sb.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      setMode("signin");
      setError("");
      setPassword("");
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs text-muted-foreground font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-10 bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs text-muted-foreground font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="h-10 bg-background"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive font-medium">{error}</p>
          )}

          {mode === "signup" && (
            <p className="text-xs text-muted-foreground">
              A confirmation email will be sent. Check your inbox.
            </p>
          )}

          <Button
            type="submit"
            disabled={busy || !email || !password}
            className="w-full h-11 text-sm font-medium shadow-xs"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {mode === "signin" ? "Signing in..." : "Creating account..."}
              </>
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className="font-medium text-primary hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className="font-medium text-primary hover:underline"
              >
                Sign In
              </button>
            </>
          )}
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
