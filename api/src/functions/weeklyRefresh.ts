import { app, InvocationContext, Timer } from "@azure/functions";
import { readJsonBlob, writeJsonBlob } from "../blobStorage";
import { researchJson, formatUsage, skipLocalRefresh, ResearchError } from "../claude";
import { WeeklyData } from "../types";
import { allowedDomainsForPrompt } from "../outlets";
import { validateWeekly, TECH_TOPICS, MAX_PER_OUTLET } from "../validation";

const WEEKLY_INTELLIGENCE_PROMPT = `You are an intelligence analyst for GulfCryo, an industrial gas company operating across 10 countries in the Middle East (UAE, Saudi Arabia, Kuwait, Bahrain, Qatar, Oman, Jordan, Iraq, Turkey, Egypt).

Use the web_search tool to research this week's industrial gas industry competitive landscape, growth opportunities, underserved sectors, regional infrastructure projects, and hydrogen/renewables/industrial-gas technology news relevant to ATC (Application Technology Center — Saudi Aramco / Gulf Cryo joint center at SPARK). Every item must be based on a real article, filing, or announcement you actually found; do not invent competitor moves, figures, or projects. Once your research is complete, respond with a single JSON object (no markdown, no commentary) matching this exact shape:

{
  "industrySummary": {
    "competitors": [ { "country": "...", "linde": { "value": "Dominant|Strong|Active|Limited", "tone": "danger|accent|warning" }, "airProducts": {...}, "airLiquide": {...}, "messer": {...}, "gcOpportunity": { "value": "Contested|Moderate|High", "tone": "..." } } ],
    "opportunities": [ { "code": "2-letter country code", "country": "...", "sector": "...", "score": 0-100, "summary": "...", "actionUrgency": "IMMEDIATE|SHORT-TERM", "action": "...", "potential": "...", "progress": 0-100 } ],
    "whiteSpace": [ { "icon": "material-symbol-name", "tier": "HIGH|MEDIUM|EMERGING", "tone": "accent|warning|cyan", "title": "...", "desc": "...", "angle": "..." } ]
  },
  "projectTracker": {
    "kpis": [ { "label": "ACTIVE PROJECTS", "value": "...", "delta": "...", "icon": "groups", "tone": "neutral" }, { "label": "PROJECTED DEMAND", "value": "...", "suffix": "BCM/Y", "delta": "...", "icon": "database", "tone": "neutral" }, { "label": "SUSTAINABILITY INDEX", "value": "...", "delta": "...", "icon": "eco", "tone": "accent" }, { "label": "SYSTEM ALERTS", "value": "...", "delta": "...", "icon": "warning", "tone": "danger" } ],
    "projects": [ { "title": "...", "location": "...", "status": "...", "statusTone": "accent|warning|cyan|danger", "gasDemand": "...", "innovation": "...", "quote": "...", "atcConnection": true|false, "icon": "material-symbol-name", "category": "construction|renewable|sustainability" } ],
    "territories": [ { "country": "...", "projects": 0, "innovationPct": 0-100, "sector": "...", "opportunity": "HIGH|MEDIUM|EMERGING", "trend": "up|down|flat" } ]
  },
  "techArticles": [ { "tag": "${TECH_TOPICS.join("|")}", "tone": "accent|cyan|warning", "time": "...", "title": "...", "desc": "...", "source": "...", "sourceUrl": "https://exact-article-url-from-search", "publishedAt": "YYYY-MM-DD", "size": "featured|wide|standard|half", "icon": "material-symbol-name", "region": "MENA|Europe|ASEAN|Americas" } ]
}

IMPORTANT: each techArticles "tag" must be exactly one of: ${TECH_TOPICS.join(", ")}. Use at most ${MAX_PER_OUTLET} articles from any one outlet, and spread the rest across different outlets on the allowed list. Articles with other tags, or beyond ${MAX_PER_OUTLET} per outlet, are discarded automatically.

Aim for genuine regional spread across techArticles (not everything MENA) — include real hydrogen/CCUS/industrial-gas developments from Europe, ASEAN, and the Americas where relevant, not just the Gulf.

IMPORTANT: "sourceUrl" must be the exact, real URL of the specific article you found via web_search — not the outlet's homepage, and not a fabricated URL. Do not use Reuters as a source.

IMPORTANT: "publishedAt" is each article's real publication date as shown on the page or in the search result. techArticles must be published within the last 21 days; older items are discarded automatically. Spend at least 4 of your searches specifically on recent technology news for techArticles, putting the current month and year in each query (for example "green hydrogen electrolyser news <Month> <Year>"), and prefer the trade press on the allowed list. Do not use background, company-profile or announcement pieces from earlier years.

IMPORTANT: Only cite articles published on these domains: ${allowedDomainsForPrompt()}. Items linking anywhere else are discarded automatically, as are links that are dead or point to a homepage.

Your FINAL message must contain ONLY the JSON object and nothing else — no preamble, no summary of your research process, no markdown code fences, no text before or after it.`;

function getIsoWeek(date: Date): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function weeklyRefresh(myTimer: Timer, context: InvocationContext): Promise<void> {
  context.log("weeklyRefresh triggered at", new Date().toISOString());

  if (skipLocalRefresh()) {
    context.warn("weeklyRefresh skipped: running locally and ALLOW_LOCAL_REFRESH is not 'true' (avoids spending API credit on host restarts).");
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    context.error("ANTHROPIC_API_KEY is not set. Skipping weeklyRefresh.");
    return;
  }

  let text: string;
  try {
    // 10 searches, not 15: the last 15-search run read 1.24M input tokens ($4.50).
    const research = await researchJson(apiKey, WEEKLY_INTELLIGENCE_PROMPT, 10);
    text = research.text;
    context.log(`weeklyRefresh usage: ${formatUsage(research.usage)}`);
  } catch (err) {
    context.error("weeklyRefresh: research call failed; keeping previous data.", err);
    if (err instanceof ResearchError) context.warn(`weeklyRefresh usage (failed run): ${formatUsage(err.usage)}`);
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    context.error("Claude's final response was not valid JSON:", text.slice(0, 500), err);
    return;
  }

  let previous: WeeklyData | null = null;
  try {
    previous = await readJsonBlob<WeeklyData>("current-weekly.json");
  } catch (err) {
    context.warn("weeklyRefresh: could not read the previous weekly blob; no tech-article fallback this run.", err);
  }

  const result = await validateWeekly(parsed, {}, previous?.techArticles ?? null);
  for (const drop of result.drops) {
    context.warn(`weeklyRefresh dropped ${drop.where}: ${drop.reason} (${drop.url})`);
  }
  if (!result.ok) {
    context.error(`weeklyRefresh rejected the run, keeping previous data: ${result.reason}`);
    return;
  }
  const data: WeeklyData = result.data;

  const week = getIsoWeek(new Date());

  await writeJsonBlob(`weekly/${week}.json`, data);
  await writeJsonBlob("current-weekly.json", data);

  context.log(`weeklyRefresh complete for ${week}`);
}

app.timer("weeklyRefresh", {
  schedule: "0 0 3 * * 0",
  handler: weeklyRefresh,
});
