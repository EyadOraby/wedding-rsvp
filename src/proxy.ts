import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  USER_SESSION_COOKIE,
  verifySessionToken,
  verifyUserToken,
} from "@/lib/session";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login"]);

/** Browsers always send Origin on cross-site POST/PUT/PATCH/DELETE requests. */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function unauthorized(isApi: boolean, request: NextRequest, loginPath: string) {
  if (isApi) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }
  const url = new URL(loginPath, request.url);
  if (loginPath === "/login") {
    url.searchParams.set("next", request.nextUrl.pathname);
  }
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (isApi && !SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-origin request blocked" },
      { status: 403 },
    );
  }

  // The original single-wedding admin.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();
    const signedIn = await verifySessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    return signedIn
      ? NextResponse.next()
      : unauthorized(isApi, request, "/admin/login");
  }

  // Builder accounts.
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/events")) {
    const userId = await verifyUserToken(
      request.cookies.get(USER_SESSION_COOKIE)?.value,
    );
    return userId
      ? NextResponse.next()
      : unauthorized(isApi, request, "/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/:path*"],
};
