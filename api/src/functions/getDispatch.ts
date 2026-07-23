import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { readJsonBlob } from "../blobStorage";
import { DailyData, WeeklyData, MarketsData } from "../types";

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
    readJsonBlob<DailyData>("current-daily.json"),
    readJsonBlob<WeeklyData>("current-weekly.json"),
    readJsonBlob<MarketsData>("markets-latest.json"),
  ]);

  if (!daily) {
    return { status: 404, jsonBody: { error: "No daily dispatch available yet." } };
  }

  const bundle = {
    dashboard: {
      ...daily.dashboard,
      marketSeries: markets?.marketSeries ?? [],
    },
    geopolitical: daily.geopolitical,
    industrySummary: weekly?.industrySummary ?? null,
    projectTracker: weekly?.projectTracker ?? null,
    techArticles: weekly?.techArticles ?? null,
    ticker: markets?.ticker ?? [],
    generated_at: daily.generated_at,
  };

  context.log("getDispatch served merged bundle");

  return {
    status: 200,
    jsonBody: bundle,
  };
}

app.http("getDispatch", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "dispatch",
  handler: getDispatch,
});
