import { NextRequest, NextResponse } from "next/server";

// The login page's client-side fetch("/api/auth") stays same-origin against
// the App Service, so once the Functions API lives on its own domain
// (NEXT_PUBLIC_API_BASE) the browser never needs cross-site cookies or CORS
// for login — this route forwards the request server-side instead and
// re-attaches the Function App's Set-Cookie verbatim on our own origin.
const FUNCTIONS_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:7071";

export async function POST(request: NextRequest) {
  const body = await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${FUNCTIONS_BASE}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable." }, { status: 502 });
  }

  const responseBody = await upstream.text();
  const response = new NextResponse(responseBody, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });

  for (const cookie of upstream.headers.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}
