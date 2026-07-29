import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSafeRedirectPath(redirect: string | null) {
  return redirect?.startsWith("/") ? redirect : "/";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirectPath = getSafeRedirectPath(
    request.nextUrl.searchParams.get("redirect")
  );

  if (!code) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Missing OAuth code");
    if (redirectPath !== "/") {
      loginUrl.searchParams.set("redirect", redirectPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(redirectPath, request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", error.message);
    if (redirectPath !== "/") {
      loginUrl.searchParams.set("redirect", redirectPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
