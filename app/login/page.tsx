"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  FileCheck2,
  Loader2,
  Receipt,
  ShieldCheck,
} from "lucide-react";

const enter: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M21.8 12.23c0-.71-.06-1.23-.2-1.77H12v3.55h5.63c-.11.88-.71 2.2-2.04 3.09l-.02.12 2.97 2.3.2.02c1.82-1.68 3.06-4.15 3.06-7.31Z" />
      <path fill="#34A853" d="M12 22c2.76 0 5.08-.91 6.77-2.46l-3.22-2.44c-.86.6-2.01 1.02-3.55 1.02a6.14 6.14 0 0 1-5.8-4.25l-.11.01-3.08 2.39-.04.11A10.22 10.22 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.2 13.87A6.4 6.4 0 0 1 5.86 12c0-.65.12-1.28.33-1.87l-.01-.13-3.12-2.43-.1.05A10.19 10.19 0 0 0 1.78 12c0 1.58.38 3.07 1.18 4.38l3.24-2.51Z" />
      <path fill="#EA4335" d="M12 5.87c1.94 0 3.25.84 4 1.54l2.92-2.85C17.07 2.83 14.76 2 12 2a10.22 10.22 0 0 0-9.04 5.62L6.2 10.13A6.15 6.15 0 0 1 12 5.87Z" />
    </svg>
  );
}

function LoginForm() {
  const reduceMotion = useReducedMotion();
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

  const motionProps = reduceMotion
    ? { initial: false }
    : { initial: "hidden", animate: "visible" as const };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-background p-3 text-foreground sm:p-5 lg:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_92%,rgba(71,201,137,0.16),transparent_25%),radial-gradient(circle_at_88%_7%,rgba(34,95,99,0.14),transparent_29%)]" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[1.75rem] border border-white/80 bg-card shadow-[0_30px_90px_rgba(28,75,79,0.12)] lg:min-h-[calc(100dvh-3.5rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)]">
        <section className="relative flex min-h-[620px] flex-col px-6 py-7 sm:px-12 sm:py-10 lg:min-h-0 lg:px-[clamp(3rem,7vw,8.5rem)] lg:py-[clamp(2.5rem,7vh,6rem)]">
          <motion.div custom={0} variants={enter} {...motionProps} className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-[0_8px_18px_rgba(34,95,99,0.24)]">
              <Receipt className="size-[1.15rem] text-white" strokeWidth={2.4} />
            </div>
            <span className="text-[1.08rem] font-semibold tracking-[-0.035em]">BillTool</span>
          </motion.div>

          <div className="my-auto max-w-sm py-14 lg:py-10">
            <motion.h1 custom={0.1} variants={enter} {...motionProps} className="text-balance text-[clamp(2.3rem,4vw,3.7rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground">
              Welcome back.
            </motion.h1>
            <motion.p custom={0.16} variants={enter} {...motionProps} className="mt-4 text-pretty text-[0.98rem] leading-7 text-muted-foreground">
              Sign in to manage your invoices.
            </motion.p>

            <motion.form custom={0.22} variants={enter} {...motionProps} onSubmit={handleGoogleSignIn} className="mt-8">
              <button
                type="submit"
                disabled={busy}
                className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-border bg-card px-5 text-[0.94rem] font-semibold text-foreground shadow-[0_3px_0_rgba(34,95,99,0.04),0_10px_25px_rgba(34,95,99,0.09)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_5px_0_rgba(34,95,99,0.04),0_16px_30px_rgba(34,95,99,0.14)] active:translate-y-0 active:scale-[0.985] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
              >
                <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                {busy ? <Loader2 className="size-5 animate-spin text-primary" /> : <GoogleMark />}
                <span>{busy ? "Taking you to Google…" : "Continue with Google"}</span>
                {!busy && <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Secure sign-in powered by Google
              </p>
              {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
            </motion.form>
          </div>

        </section>

        <section className="relative hidden overflow-hidden bg-[#173d42] p-[clamp(2rem,4vw,4.5rem)] text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(71,201,137,0.14),transparent_45%)]" />

          <motion.div custom={0.16} variants={enter} {...motionProps} className="relative flex justify-end">
            <span className="text-xs font-medium text-white/55">SAI Communication System</span>
          </motion.div>

          <motion.div custom={0.28} variants={enter} {...motionProps} className="relative my-auto">
            <div className="relative mx-auto max-w-[540px] rounded-[2rem] border border-white/15 bg-white/[0.09] p-5 shadow-[0_32px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <div className="rounded-[1.5rem] bg-[#fbfdfc] p-6 text-[#1f3740] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <div className="flex items-start justify-between border-b border-[#e2eeec] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#225f63] text-white"><Receipt className="size-5" /></div>
                    <div><p className="text-sm font-bold tracking-[-0.03em]">BillTool</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.13em] text-[#668089]">Tax invoice</p></div>
                  </div>
                  <div className="rounded-lg bg-[#e5f6ed] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#24766e]">Draft</div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-6">
                  <div><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8793a8]">Billed to</p><p className="mt-2 text-sm font-semibold">Aarav Enterprises</p><p className="mt-1 text-xs leading-5 text-[#7b8799]">New Delhi · 110001<br />GSTIN 07AABCA0000A1Z5</p></div>
                  <div className="text-right"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8793a8]">Invoice no.</p><p className="mt-2 text-sm font-semibold">#BT-2026-042</p><p className="mt-1 text-xs leading-5 text-[#7b8799]">30 July 2026<br />Due on receipt</p></div>
                </div>
                <div className="mt-7 rounded-xl border border-[#e6eaf2] bg-white p-4">
                  <div className="flex items-center justify-between text-xs font-medium text-[#69768c]"><span>Wireless connectivity services</span><span className="font-semibold text-[#243250]">₹ 48,000</span></div>
                  <div className="my-3 h-px bg-[#e9edf4]" />
                  <div className="flex items-end justify-between"><span className="text-xs font-semibold text-[#60708b]">Total including GST</span><span className="text-xl font-bold tracking-[-0.04em] text-[#183a80]">₹ 56,640</span></div>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-4 flex items-center gap-2 rounded-xl border border-white/20 bg-[#39a97b] px-3 py-2.5 text-xs font-semibold text-white shadow-lg"><FileCheck2 className="size-4" /> GST ready <Check className="size-3.5" /></div>
            </div>
          </motion.div>

        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading your workspace</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
