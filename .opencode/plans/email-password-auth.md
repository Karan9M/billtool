# Switch from Google OAuth to Email/Password Auth

## Files to change

### 1. `app/login/page.tsx` — Rewrite with email/password form

Replace Google OAuth button with:
- Email input
- Password input
- Sign In / Sign Up toggle
- Calls `signInWithPassword()` or `signUp()` from Supabase
- Shows inline errors
- Redirects to dashboard on success
- Loader spinner while busy

### 2. `components/auth/AuthProvider.tsx` — Remove OAuth code exchange

Delete the `?code=` URL parameter exchange block. Keep only:
- `getUser()` on mount
- `onAuthStateChange` listener for session changes
- Remove `useRouter` import (no longer needed)

### 3. `proxy.ts` — Remove OAuth-specific public route checks

- Remove `hasCode` / `isAuthRedirect` from public route logic
- Remove `/auth/callback` from `PUBLIC_ROUTES`
- Only `/login` remains public

### 4. Delete `app/auth/callback/route.ts`

No longer needed — email/password doesn't use redirect callbacks.

### 5. `app/auth/signout/route.ts` — No changes needed

`supabase.auth.signOut()` works for all auth methods.

## How it works

1. User enters email + password on `/login`
2. Sign In: `supabase.auth.signInWithPassword()` authenticates directly
3. Sign Up: `supabase.auth.signUp()` creates user (confirmation email sent by default)
4. Supabase sets session cookies automatically
5. Proxy detects session and allows access to protected routes
6. Sign Out clears session and redirects to `/login`

## Supabase setup needed

- **Authentication → Providers → Email**: Enable it (should be on by default)
- Optional: Disable email confirmation in **Authentication → Settings** for instant sign-up
