"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface AuthContext {
  user: User | null;
  loading: boolean;
}

const AuthCtx = createContext<AuthContext>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sb = getSupabaseBrowser();

    // Handle OAuth code in URL (works even if callback route isn't hit)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      sb.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error("Auth exchange error:", error.message);
          }
          // Clean URL params regardless of outcome
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      sb.auth.getUser().then(({ data }) => {
        setUser(data.user ?? null);
        setLoading(false);
      });
    }

    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, [router]);

  return <AuthCtx.Provider value={{ user, loading }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
