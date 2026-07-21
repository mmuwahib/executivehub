import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { readJsonBlob } from "../blobStorage";
import { DailyDispatch, WeeklyDispatch, MarketsDispatch } from "../types";

const AUTH_COOKIE = "atc-auth";

export async function getDispatch(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const hasAuthCookie = cookieHeader
    .split(";")
    .some((c) => c.trim().startsWith(`${AUTH_COOKIE}=`));

  if (!hasAuthCookie) {
    return { status: 401, jsonBody: { error: "Unauthorized" } };
  }

  const [daily, weekly, markets] = await Promise.all([
    readJsonBlob<DailyDispatch>("current-daily.json"),
    readJsonBlob<WeeklyDispatch>("current-weekly.json"),
    readJsonBlob<MarketsDispatch>("markets-latest.json"),
  ]);

  if (!daily) {
    return { status: 404, jsonBody: { error: "No daily dispatch available yet." } };
  }

  const merged = {
    ...daily,
    markets: markets?.markets ?? daily.markets,
    weekly: weekly ?? undefined,
  };

  context.log("getDispatch served merged dispatch");

  return {
    status: 200,
    jsonBody: merged,
  };
}

app.http("getDispatch", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "dispatch",
  handler: getDispatch,
});
