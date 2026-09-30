import { NextRequest, NextResponse } from "next/server";
import { SHOW_GEOPOLITICAL } from "@/lib/features";

const AUTH_COOKIE = "atc-auth";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE);

  if (!authCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!SHOW_GEOPOLITICAL && request.nextUrl.pathname.startsWith("/geopolitical")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.svg).*)"],
};
