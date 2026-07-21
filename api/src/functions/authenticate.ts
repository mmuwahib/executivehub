import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as crypto from "crypto";

const AUTH_COOKIE = "atc-auth";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function signToken(secret: string): string {
  const issuedAt = Date.now().toString();
  const signature = crypto.createHmac("sha256", secret).update(issuedAt).digest("hex");
  return Buffer.from(`${issuedAt}.${signature}`).toString("base64url");
}

export async function authenticate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;
  if (!dashboardPassword) {
    context.error("DASHBOARD_PASSWORD is not set.");
    return { status: 500, jsonBody: { error: "Server not configured." } };
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password ?? "";

  if (password !== dashboardPassword) {
    return { status: 401, jsonBody: { error: "Incorrect password." } };
  }

  const token = signToken(dashboardPassword);

  return {
    status: 200,
    jsonBody: { ok: true },
    cookies: [
      {
        name: AUTH_COOKIE,
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      },
    ],
  };
}

app.http("authenticate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "auth",
  handler: authenticate,
});
