"use client";

import { createBrowserClient } from "@supabase/ssr";
import { fetchWithTimeout } from "./fetch-with-timeout";

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Supabase env vars are missing. Copy .env.local.example to .env.local and fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  cachedClient = createBrowserClient(url, anon, {
    global: { fetch: fetchWithTimeout },
  });
  return cachedClient;
}
