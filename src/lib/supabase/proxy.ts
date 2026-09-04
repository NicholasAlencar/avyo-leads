import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env/public";

function isPublicPath(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/auth/");
}

function loginRedirect(request: NextRequest, reason?: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = reason ? `?reason=${reason}` : "";
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let env;

  try {
    env = getPublicEnv();
  } catch {
    return isPublicPath(request.nextUrl.pathname)
      ? NextResponse.next({ request })
      : loginRedirect(request, "not_configured");
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return isPublicPath(request.nextUrl.pathname)
      ? NextResponse.next({ request })
      : loginRedirect(request, "not_configured");
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);

  if (!isAuthenticated && !isPublicPath(request.nextUrl.pathname)) {
    return loginRedirect(request);
  }

  if (isAuthenticated && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
