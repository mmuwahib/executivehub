import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Logout needs no secret (unlike /api/auth, which validates DASHBOARD_PASSWORD
// via the Azure Functions host) — it just clears a cookie, so this is a plain
// Next.js Route Handler rather than an Azure Function. It's also why this
// isn't swallowed by next.config.js's dev-only /api/:path* -> :7071 rewrite:
// Next checks filesystem routes before applying array-form rewrites.
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("atc-auth");
  return NextResponse.json({ ok: true });
}
