import { app, InvocationContext, Timer } from "@azure/functions";
import { writeJsonBlob } from "../blobStorage";
import { researchJson, formatUsage, skipLocalRefresh } from "../claude";
import { WeeklyData } from "../types";
import { allowedDomainsForPrompt } from "../outlets";
import { validateWeekly } from "../validation";

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
  "techArticles": [ { "tag": "...", "tone": "accent|cyan|warning", "time": "...", "title": "...", "desc": "...", "source": "...", "sourceUrl": "https://exact-article-url-from-search", "size": "featured|wide|standard|half", "icon": "material-symbol-name", "region": "MENA|Europe|ASEAN|Americas" } ]
}

Aim for genuine regional spread across techArticles (not everything MENA) — include real hydrogen/CCUS/industrial-gas developments from Europe, ASEAN, and the Americas where relevant, not just the Gulf.

IMPORTANT: "sourceUrl" must be the exact, real URL of the specific article you found via web_search — not the outlet's homepage, and not a fabricated URL. Do not use Reuters as a source.

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
    const research = await researchJson(apiKey, WEEKLY_INTELLIGENCE_PROMPT, 15);
    text = research.text;
    context.log(`weeklyRefresh usage: ${formatUsage(research.usage)}`);
  } catch (err) {
    context.error("weeklyRefresh: research call failed; keeping previous data.", err);
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    context.error("Claude's final response was not valid JSON:", text.slice(0, 500), err);
    return;
  }

  const result = await validateWeekly(parsed);
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
