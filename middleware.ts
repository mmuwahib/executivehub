import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "atc-auth";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE);

  if (!authCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.svg).*)"],
};
