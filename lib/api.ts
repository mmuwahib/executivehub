import { cookies, headers } from "next/headers";
import {
  dashboardData as mockDashboard,
  geopoliticalData as mockGeopolitical,
  industrySummaryData as mockIndustrySummary,
  projectTrackerData as mockProjectTracker,
  techArticles as mockTechArticles,
} from "./mock-data";
import { HEADER_TICKER } from "./nav";
import {
  DashboardData,
  GeopoliticalData,
  IndustrySummaryData,
  ProjectTrackerData,
  TechArticle,
  TickerItem,
} from "./types";

interface DispatchBundle {
  dashboard: DashboardData | null;
  geopolitical: GeopoliticalData | null;
  industrySummary: IndustrySummaryData | null;
  projectTracker: ProjectTrackerData | null;
  techArticles: TechArticle[] | null;
  ticker: TickerItem[];
}

async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  const h = await headers();
  const host = h.get("host");
  if (!host) return "";
  const protocol = h.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

// Fetches the live dispatch bundle from the Azure Functions API, forwarding
// the auth cookie (server-side fetch doesn't send browser cookies
// automatically). Returns null on any failure — callers fall back to mock
// data so the app never breaks when the Functions host isn't reachable
// (e.g. local `next dev` without the SWA CLI proxy, or no live data yet).
async function fetchDispatch(): Promise<DispatchBundle | null> {
  try {
    const base = await getBaseUrl();
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("atc-auth");
    if (!authCookie) return null;

    const res = await fetch(`${base}/api/dispatch`, {
      cache: "no-store",
      headers: { Cookie: `atc-auth=${authCookie.value}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as DispatchBundle;
  } catch {
    return null;
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const bundle = await fetchDispatch();
  return bundle?.dashboard ?? mockDashboard;
}

export async function getGeopoliticalData(): Promise<GeopoliticalData> {
  const bundle = await fetchDispatch();
  return bundle?.geopolitical ?? mockGeopolitical;
}

export async function getIndustrySummaryData(): Promise<IndustrySummaryData> {
  const bundle = await fetchDispatch();
  return bundle?.industrySummary ?? mockIndustrySummary;
}

export async function getProjectTrackerData(): Promise<ProjectTrackerData> {
  const bundle = await fetchDispatch();
  return bundle?.projectTracker ?? mockProjectTracker;
}

export async function getTechArticles(): Promise<TechArticle[]> {
  const bundle = await fetchDispatch();
  return bundle?.techArticles ?? mockTechArticles;
}

export async function getMarketTicker(): Promise<TickerItem[]> {
  const bundle = await fetchDispatch();
  return bundle?.ticker?.length ? bundle.ticker : HEADER_TICKER;
}
