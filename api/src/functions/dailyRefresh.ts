import { app, InvocationContext, Timer } from "@azure/functions";
import { writeJsonBlob } from "../blobStorage";
import { researchJson } from "../claude";
import { DailyData } from "../types";
import { allowedDomainsForPrompt } from "../outlets";
import { validateDaily } from "../validation";

const DAILY_INTELLIGENCE_PROMPT = `You are an intelligence analyst for GulfCryo, an industrial gas company operating across 10 countries in the Middle East (UAE, Saudi Arabia, Kuwait, Bahrain, Qatar, Oman, Jordan, Iraq, Turkey, Egypt).

Use the web_search tool to research today's most relevant geopolitical and business developments — search for real, current news from the last 24-48 hours covering the Middle East region and the global industrial gas industry. Every item below must be based on an article you actually found; do not invent events, figures, quotes, or sources. If you cannot find a genuine, current story for a section, use the closest real story you did find rather than fabricating one.

Once your research is complete, respond with a single JSON object (no markdown, no commentary) matching this exact shape:

{
  "generated_at": "ISO 8601 timestamp",
  "dashboard": {
    "kpis": [
      { "label": "Geopolitical Risk", "value": "...", "delta": "...", "icon": "warning", "tone": "danger|accent|warning|neutral" },
      { "label": "Industry Status", "value": "...", "delta": "...", "icon": "verified", "tone": "..." },
      { "label": "Active Projects", "value": "...", "delta": "...", "icon": "layers", "tone": "neutral" },
      { "label": "GC Opportunity Score", "value": "...", "delta": "...", "icon": "radar", "tone": "accent" }
    ],
    "geoPulse": [ { "tag": "WARNING|MONITOR", "title": "...", "source": "...", "sourceUrl": "https://exact-article-url-from-search", "time": "..." } ],
    "industryWeekly": [ { "tag": "...", "tone": "accent|cyan|warning|danger|neutral", "title": "...", "desc": "...", "source": "...", "sourceUrl": "https://exact-article-url-from-search", "region": "MENA|Europe|ASEAN|Americas" } ],
    "leadershipMoves": [ { "company": "Linde|Air Products|Air Liquide|Messer|...", "initials": "2-letter", "role": "...", "region": "MENA|Europe|ASEAN|Americas", "desc": "...", "source": "...", "sourceUrl": "https://exact-article-url-from-search" } ],
    "projectHighlights": [ { "title": "...", "location": "...", "progress": 0-100, "tone": "..." } ],
    "opportunityRadar": [ { "code": "2-letter country code", "country": "...", "sector": "...", "tier": "High|Moderate", "potential": "..." } ]
  },
  "geopolitical": {
    "hotZone": { "name": "...", "coords": "...", "lat": 0.0, "lng": 0.0, "detail": "..." },
    "riskRegions": [ { "name": "...", "pct": 0-100, "tone": "..." } ],
    "criticalIncident": { "title": "...", "desc": "...", "time": "...", "lat": 0.0, "lng": 0.0, "source": "...", "sourceUrl": "https://exact-article-url-from-search" },
    "countryRisk": [ { "country": "Saudi Arabia|UAE|Kuwait|Bahrain|Qatar|Oman|Jordan|Iraq|Turkey|Egypt", "lat": 0.0, "lng": 0.0, "tier": "high|moderate|low" } ],
    "articles": [ { "tag": "WARNING|MONITOR", "region": "...", "time": "...", "title": "...", "desc": "...", "source": "...", "sourceUrl": "https://exact-article-url-from-search" } ]
  }
}

IMPORTANT: "sourceUrl" must be the exact, real URL of the specific article you found via web_search — not the outlet's homepage, and not a fabricated URL. Every sourceUrl must come directly from a search result you actually retrieved.

IMPORTANT: Only cite articles published on these domains: ${allowedDomainsForPrompt()}. Items linking anywhere else are discarded automatically, as are links that are dead or point to a homepage. "countryRisk" must contain exactly one entry for each of the 10 countries listed above, using those exact country names.

IMPORTANT: Do not use Reuters as a source. Pick the real English-language outlet native to the story's own country: Khaleej Times only for UAE-datelined stories, Arab News for Saudi Arabia-datelined stories, Al Jazeera for pan-regional or cross-border stories with no single-country angle. Never use an outlet from a different country than the story it's attached to.

Your FINAL message must contain ONLY the JSON object and nothing else — no preamble, no summary of your research process, no markdown code fences, no text before or after it.`;

export async function dailyRefresh(myTimer: Timer, context: InvocationContext): Promise<void> {
  context.log("dailyRefresh triggered at", new Date().toISOString());

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    context.error("ANTHROPIC_API_KEY is not set. Skipping dailyRefresh.");
    return;
  }

  let text: string;
  try {
    text = await researchJson(apiKey, DAILY_INTELLIGENCE_PROMPT, 12);
  } catch (err) {
    context.error("dailyRefresh: research call failed; keeping previous data.", err);
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    context.error("Claude's final response was not valid JSON:", text.slice(0, 500), err);
    return;
  }

  const result = await validateDaily(parsed);
  for (const drop of result.drops) {
    context.warn(`dailyRefresh dropped ${drop.where}: ${drop.reason} (${drop.url})`);
  }
  if (!result.ok) {
    context.error(`dailyRefresh rejected the run, keeping previous data: ${result.reason}`);
    return;
  }
  const data: DailyData = result.data;

  const date = new Date().toISOString().slice(0, 10);

  await writeJsonBlob(`daily/${date}.json`, data);
  await writeJsonBlob("current-daily.json", data);

  context.log(`dailyRefresh complete for ${date}`);
}

app.timer("dailyRefresh", {
  schedule: "0 0 3 * * *",
  handler: dailyRefresh,
});
