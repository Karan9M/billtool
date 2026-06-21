/**
 * Wraps the global fetch with a request-level timeout. Supabase clients accept
 * a custom fetch via `global.fetch`, so we pass this in to fail fast (3s)
 * instead of letting the default ~20s TCP timeout block every Server Component.
 */
const DEFAULT_TIMEOUT_MS = 8000;

export const fetchWithTimeout: typeof fetch = (input, init) => {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), DEFAULT_TIMEOUT_MS);
  return fetch(input, { ...init, signal: init?.signal ?? ac.signal }).finally(
    () => clearTimeout(id)
  );
};
