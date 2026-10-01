import { isAllowedHost } from "./outlets";
import { DailyData, WeeklyData } from "./types";

// Guardrails between Claude's output and Blob Storage. The refresh functions
// call validateDaily/validateWeekly after JSON.parse and only write the blob
// when the result is ok, so a bad run can never replace the last good data.
//
// What is checked:
//  - structure: every array/object the pages .map() over exists
//  - each sourced item: https URL, host on the allow-list (outlets.ts), a
//    specific article path (not a homepage), a recent publishedAt date
//    (MAX_AGE_DAYS), no duplicate URLs
//  - reachability: items whose link is definitively dead are dropped
//  - minimum item counts per section, else the whole run is rejected

export interface Drop {
  where: string;
  url: string;
  reason: string;
}

export type Validated<T> =
  | { ok: true; data: T; drops: Drop[] }
  | { ok: false; reason: string; drops: Drop[] };

export interface ValidationOptions {
  // Skip the network reachability check (offline tests only).
  skipLinkCheck?: boolean;
}

const MIN_ITEMS = {
  geoPulse: 2,
  industryWeekly: 2,
  articles: 2,
  techArticles: 3,
};

const REQUIRED_COUNTRIES = 10;

// The Tech & Innovation page's topic filters; tech article tags must match.
export const TECH_TOPICS = ["Hydrogen", "Renewable", "CCS/CCU", "Innovation"] as const;

// Keeps the tech feed from being filled by one outlet.
export const MAX_PER_OUTLET = 2;

// How recent a sourced item must be (by its publishedAt date) to be published.
const MAX_AGE_DAYS = {
  daily: 7,
  leadership: 30,
  weekly: 21,
};

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function staticUrlProblem(raw: unknown): string | null {
  if (!isStr(raw)) return "missing sourceUrl";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "malformed URL";
  }
  if (url.protocol !== "https:") return `non-https scheme (${url.protocol})`;
  if (!isAllowedHost(url.hostname)) return `host not on allow-list (${url.hostname})`;
  if (url.pathname === "/" || url.pathname === "") return "homepage-only URL, not a specific article";
  return null;
}

// Only definitive failures count as dead. News sites routinely answer bots
// with 403/429 or stall, and dropping those would discard valid articles, so
// blocked/timeout/5xx responses are treated as "unverifiable" and kept.
async function deadLinkReason(rawUrl: string): Promise<string | null> {
  const request = (method: "HEAD" | "GET") =>
    fetch(rawUrl, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GulfCryoLinkCheck/1.0)" },
    });

  try {
    let res = await request("HEAD");
    if (res.status === 404 || res.status === 405 || res.status === 501) {
      res = await request("GET");
    }
    if (res.status === 404 || res.status === 410) return `link is dead (HTTP ${res.status})`;
    if (res.url) {
      const finalPath = new URL(res.url).pathname;
      if (finalPath === "/" || finalPath === "") return "link redirects to the homepage";
    }
    return null;
  } catch (err) {
    const code = (err as { cause?: { code?: string } }).cause?.code;
    if (code === "ENOTFOUND") return "DNS lookup failed";
    return null;
  }
}

// Filters one array of sourced items in place of the model's output. Items
// that are not objects, lack a title/source, or have a bad link are dropped
// and recorded in `drops`.
const DAY_MS = 24 * 60 * 60 * 1000;

// Model output gives each item's publication date as "publishedAt"
// (YYYY-MM-DD). Missing, unparseable, too old or future-dated → a reason.
function ageProblem(raw: unknown, maxAgeDays: number): string | null {
  if (!isStr(raw)) return "missing publishedAt date";
  const published = Date.parse(raw);
  if (Number.isNaN(published)) return `unparseable publishedAt (${raw})`;
  const ageDays = (Date.now() - published) / DAY_MS;
  if (ageDays < -1) return `publishedAt is in the future (${raw})`;
  if (ageDays > maxAgeDays) return `published ${Math.floor(ageDays)} days ago (limit ${maxAgeDays})`;
  return null;
}

async function filterSourced<T extends { sourceUrl: string }>(
  raw: unknown,
  where: string,
  drops: Drop[],
  opts: ValidationOptions,
  requiredStrings: string[],
  maxAgeDays: number
): Promise<T[] | null> {
  if (!Array.isArray(raw)) return null;

  const seen = new Set<string>();
  const candidates: T[] = [];

  for (const item of raw) {
    const url = isObj(item) ? String(item.sourceUrl ?? "") : "";
    if (!isObj(item)) {
      drops.push({ where, url, reason: "item is not an object" });
      continue;
    }
    const missing = requiredStrings.find((key) => !isStr(item[key]));
    if (missing) {
      drops.push({ where, url, reason: `missing ${missing}` });
      continue;
    }
    const problem = staticUrlProblem(item.sourceUrl) ?? ageProblem(item.publishedAt, maxAgeDays);
    if (problem) {
      drops.push({ where, url, reason: problem });
      continue;
    }
    if (seen.has(url)) {
      drops.push({ where, url, reason: "duplicate URL in this section" });
      continue;
    }
    seen.add(url);
    candidates.push(item as unknown as T);
  }

  if (opts.skipLinkCheck) return candidates;

  const verdicts = await Promise.all(candidates.map((item) => deadLinkReason(item.sourceUrl)));
  return candidates.filter((item, i) => {
    const reason = verdicts[i];
    if (reason) drops.push({ where, url: item.sourceUrl, reason });
    return !reason;
  });
}

function arrayOrNull(v: unknown): unknown[] | null {
  return Array.isArray(v) ? v : null;
}

export async function validateDaily(raw: unknown, opts: ValidationOptions = {}): Promise<Validated<DailyData>> {
  const drops: Drop[] = [];
  const fail = (reason: string): Validated<DailyData> => ({ ok: false, reason, drops });

  if (!isObj(raw)) return fail("top-level value is not an object");
  const { dashboard, geopolitical } = raw;
  if (!isObj(dashboard)) return fail("missing dashboard object");
  if (!isObj(geopolitical)) return fail("missing geopolitical object");

  for (const key of ["kpis", "projectHighlights", "opportunityRadar"]) {
    if (!arrayOrNull(dashboard[key])) return fail(`dashboard.${key} is not an array`);
  }
  if ((dashboard.kpis as unknown[]).length === 0) return fail("dashboard.kpis is empty");

  const geoPulse = await filterSourced<DailyData["dashboard"]["geoPulse"][number]>(
    dashboard.geoPulse, "dashboard.geoPulse", drops, opts, ["title", "source"], MAX_AGE_DAYS.daily
  );
  const industryWeekly = await filterSourced<DailyData["dashboard"]["industryWeekly"][number]>(
    dashboard.industryWeekly, "dashboard.industryWeekly", drops, opts, ["title", "desc", "source"], MAX_AGE_DAYS.daily
  );
  const leadershipMoves = await filterSourced<DailyData["dashboard"]["leadershipMoves"][number]>(
    dashboard.leadershipMoves, "dashboard.leadershipMoves", drops, opts, ["company", "role", "desc", "source"], MAX_AGE_DAYS.leadership
  );
  const articles = await filterSourced<DailyData["geopolitical"]["articles"][number]>(
    geopolitical.articles, "geopolitical.articles", drops, opts, ["title", "desc", "source"], MAX_AGE_DAYS.daily
  );

  if (!geoPulse) return fail("dashboard.geoPulse is not an array");
  if (!industryWeekly) return fail("dashboard.industryWeekly is not an array");
  if (!leadershipMoves) return fail("dashboard.leadershipMoves is not an array");
  if (!articles) return fail("geopolitical.articles is not an array");

  if (geoPulse.length < MIN_ITEMS.geoPulse) return fail(`only ${geoPulse.length} valid geoPulse items (need ${MIN_ITEMS.geoPulse})`);
  if (industryWeekly.length < MIN_ITEMS.industryWeekly) return fail(`only ${industryWeekly.length} valid industryWeekly items (need ${MIN_ITEMS.industryWeekly})`);
  if (articles.length < MIN_ITEMS.articles) return fail(`only ${articles.length} valid geopolitical articles (need ${MIN_ITEMS.articles})`);

  // Geopolitical map inputs: the risk map .map()s these and reads lat/lng.
  const { hotZone, criticalIncident, countryRisk, riskRegions } = geopolitical;
  if (!isObj(hotZone) || !isStr(hotZone.name) || !isNum(hotZone.lat) || !isNum(hotZone.lng)) {
    return fail("geopolitical.hotZone needs name, lat and lng");
  }
  if (!isObj(criticalIncident) || !isNum(criticalIncident.lat) || !isNum(criticalIncident.lng) || !isStr(criticalIncident.title)) {
    return fail("geopolitical.criticalIncident needs title, lat and lng");
  }
  const incidentProblem = staticUrlProblem(criticalIncident.sourceUrl);
  if (incidentProblem) return fail(`geopolitical.criticalIncident link rejected: ${incidentProblem}`);
  if (!opts.skipLinkCheck) {
    const dead = await deadLinkReason(String(criticalIncident.sourceUrl));
    if (dead) return fail(`geopolitical.criticalIncident link rejected: ${dead}`);
  }
  if (!Array.isArray(riskRegions)) return fail("geopolitical.riskRegions is not an array");
  if (!Array.isArray(countryRisk) || countryRisk.length < REQUIRED_COUNTRIES) {
    return fail(`geopolitical.countryRisk needs ${REQUIRED_COUNTRIES} countries`);
  }
  const badCountry = countryRisk.find(
    (c) => !isObj(c) || !isStr(c.country) || !["high", "moderate", "low"].includes(String(c.tier))
  );
  if (badCountry) return fail("geopolitical.countryRisk has an entry without country/tier");

  const data = {
    // The freshness badge trusts this, so stamp it server-side rather than
    // accepting whatever timestamp the model wrote.
    generated_at: new Date().toISOString(),
    dashboard: { ...dashboard, geoPulse, industryWeekly, leadershipMoves },
    geopolitical: { ...geopolitical, articles },
  } as unknown as DailyData;

  return { ok: true, data, drops };
}

// `previousTechArticles` is the last published set. Tech news is the section
// most likely to come back stale; when too few recent articles survive, the
// previous set is kept so the (independent) industry and project analysis
// still publishes instead of the whole run being thrown away.
export async function validateWeekly(
  raw: unknown,
  opts: ValidationOptions = {},
  previousTechArticles: WeeklyData["techArticles"] | null = null
): Promise<Validated<WeeklyData>> {
  const drops: Drop[] = [];
  const fail = (reason: string): Validated<WeeklyData> => ({ ok: false, reason, drops });

  if (!isObj(raw)) return fail("top-level value is not an object");
  const { industrySummary, projectTracker } = raw;
  if (!isObj(industrySummary)) return fail("missing industrySummary object");
  if (!isObj(projectTracker)) return fail("missing projectTracker object");

  for (const key of ["competitors", "opportunities", "whiteSpace"]) {
    if (!arrayOrNull(industrySummary[key])) return fail(`industrySummary.${key} is not an array`);
  }
  for (const key of ["kpis", "projects", "territories"]) {
    if (!arrayOrNull(projectTracker[key])) return fail(`projectTracker.${key} is not an array`);
  }

  const techArticles = await filterSourced<WeeklyData["techArticles"][number]>(
    raw.techArticles, "techArticles", drops, opts, ["title", "desc", "source"], MAX_AGE_DAYS.weekly
  );
  if (!techArticles) return fail("techArticles is not an array");

  // Topic tags must be one of the Tech page's filters (case-normalised), and
  // no single outlet may supply more than MAX_PER_OUTLET articles.
  const perOutlet = new Map<string, number>();
  const curated: WeeklyData["techArticles"] = [];
  for (const article of techArticles) {
    const topic = TECH_TOPICS.find((t) => t.toLowerCase() === String(article.tag ?? "").trim().toLowerCase());
    if (!topic) {
      drops.push({ where: "techArticles", url: article.sourceUrl, reason: `tag "${article.tag}" is not one of ${TECH_TOPICS.join(", ")}` });
      continue;
    }
    const outlet = new URL(article.sourceUrl).hostname.replace(/^www\./, "");
    const count = perOutlet.get(outlet) ?? 0;
    if (count >= MAX_PER_OUTLET) {
      drops.push({ where: "techArticles", url: article.sourceUrl, reason: `more than ${MAX_PER_OUTLET} articles from ${outlet}` });
      continue;
    }
    perOutlet.set(outlet, count + 1);
    curated.push({ ...article, tag: topic });
  }

  let publishedTech = curated;
  if (curated.length < MIN_ITEMS.techArticles) {
    publishedTech = previousTechArticles ?? [];
    drops.push({
      where: "techArticles",
      url: "",
      reason: `only ${curated.length} recent articles passed (need ${MIN_ITEMS.techArticles}); ${
        previousTechArticles ? "kept the previously published set" : "published none this week"
      }`,
    });
  }

  const data = { ...raw, techArticles: publishedTech } as unknown as WeeklyData;
  return { ok: true, data, drops };
}
