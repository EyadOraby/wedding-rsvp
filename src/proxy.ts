import { NextResponse, type NextRequest } from "next/server";
import { USER_SESSION_COOKIE, verifyUserToken } from "@/lib/session";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (isApi && !SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-origin request blocked" },
      { status: 403 },
    );
  }

  const needsAccount =
    pathname.startsWith("/dashboard") || pathname.startsWith("/api/events");
  if (!needsAccount) return NextResponse.next();

  const userId = await verifyUserToken(
    request.cookies.get(USER_SESSION_COOKIE)?.value,
  );
  if (userId) return NextResponse.next();
  if (isApi) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
