import { app, InvocationContext, Timer } from "@azure/functions";
import { writeJsonBlob } from "../blobStorage";
import { researchJson, formatUsage, skipLocalRefresh, ResearchError, parseJsonAnswer } from "../claude";
import { WeeklyData } from "../types";
import { allowedDomainsForPrompt } from "../outlets";
import { methodologyForPrompt } from "../methodology";
import { validateWeekly } from "../validation";
import { getIsoWeek } from "../week";

// Industry summary + project tracker. Tech & innovation articles have their
// own run (techRefresh) so a slow or stale tech search can't hold this up.
const WEEKLY_INTELLIGENCE_PROMPT = `You are an intelligence analyst for GulfCryo, an industrial gas company operating across 10 countries in the Middle East (UAE, Saudi Arabia, Kuwait, Bahrain, Qatar, Oman, Jordan, Iraq, Turkey, Egypt).

Use the web_search tool to research this week's industrial gas competitive landscape (Linde, Air Products, Air Liquide, Messer) in these countries, Gulf Cryo's growth opportunities, under-served sectors, and the regional infrastructure projects that drive industrial gas demand, including work linked to ATC (Applications & Technology Center — Saudi Aramco / Gulf Cryo center at SPARK). Every item must be based on a real article, filing or announcement you actually found; do not invent competitor moves, figures or projects.

Rate competitors, openings, scores and tiers using exactly this scale:
${methodologyForPrompt()}

Every judgement carries its reasoning: "basis" is 1–2 sentences naming the concrete evidence you found (for example plants, pipelines, supply contracts, acquisitions, announced projects), and "sources" lists the 1–2 articles that evidence comes from. If you could not find evidence for a rating, say so plainly in "basis" (for example "No local production found in searches; rated Limited") rather than inventing a reason.

Once your research is complete, respond with a single JSON object (no markdown, no commentary) matching this exact shape:

{
  "industrySummary": {
    "competitors": [ { "country": "...", "linde": { "value": "Dominant|Strong|Active|Limited", "tone": "danger|accent|warning", "basis": "...", "sources": [ { "title": "...", "url": "https://exact-article-url-from-search" } ] }, "airProducts": {...same shape...}, "airLiquide": {...}, "messer": {...}, "gcOpportunity": { "value": "Contested|Moderate|High", "tone": "...", "basis": "...", "sources": [...] } } ],
    "opportunities": [ { "code": "2-letter country code", "country": "...", "sector": "...", "score": 0-100, "summary": "...", "actionUrgency": "IMMEDIATE|SHORT-TERM", "action": "...", "potential": "...", "progress": 0-100, "basis": "how the score was reached, factor by factor", "sources": [...] } ],
    "whiteSpace": [ { "icon": "material-symbol-name", "tier": "HIGH|MEDIUM|EMERGING", "tone": "accent|warning|cyan", "title": "...", "desc": "...", "angle": "...", "basis": "...", "sources": [...] } ]
  },
  "projectTracker": {
    "kpis": [ { "label": "ACTIVE PROJECTS", "value": "...", "delta": "...", "icon": "groups", "tone": "neutral", "basis": "what the figure counts and where it comes from" }, { "label": "PROJECTED DEMAND", "value": "...", "suffix": "BCM/Y", "delta": "...", "icon": "database", "tone": "neutral", "basis": "..." }, { "label": "SUSTAINABILITY INDEX", "value": "...", "delta": "...", "icon": "eco", "tone": "accent", "basis": "..." }, { "label": "SYSTEM ALERTS", "value": "...", "delta": "...", "icon": "warning", "tone": "danger", "basis": "..." } ],
    "projects": [ { "title": "...", "location": "...", "status": "...", "statusTone": "accent|warning|cyan|danger", "gasDemand": "...", "innovation": "...", "quote": "...", "atcConnection": true|false, "icon": "material-symbol-name", "category": "construction|renewable|sustainability" } ],
    "territories": [ { "country": "...", "projects": 0, "innovationPct": 0-100, "sector": "...", "opportunity": "HIGH|MEDIUM|EMERGING", "trend": "up|down|flat" } ]
  }
}

IMPORTANT: every "url" in "sources" must be the exact, real URL of a specific article you found via web_search — not an outlet homepage and not a fabricated URL. Only cite these domains: ${allowedDomainsForPrompt()}. Sources linking anywhere else are removed automatically. Do not use Reuters.

Your FINAL message must contain ONLY the JSON object and nothing else — no preamble, no summary of your research process, no markdown code fences, no text before or after it.`;

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
    const research = await researchJson(apiKey, WEEKLY_INTELLIGENCE_PROMPT, 8, (m) => context.log(`weeklyRefresh: ${m}`));
    text = research.text;
    context.log(`weeklyRefresh usage: ${formatUsage(research.usage)}`);
  } catch (err) {
    context.error("weeklyRefresh: research call failed; keeping previous data.", err);
    if (err instanceof ResearchError) context.warn(`weeklyRefresh usage (failed run): ${formatUsage(err.usage)}`);
    return;
  }

  let parsed: unknown;
  try {
    parsed = parseJsonAnswer(text);
  } catch (err) {
    context.error("Claude's final response was not valid JSON:", text.slice(0, 500), err);
    // Keep the paid answer so it can be inspected or recovered by hand.
    const failedPath = `failed/weeklyRefresh-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    try {
      await writeJsonBlob(failedPath, { error: String(err), raw: text });
      context.warn(`weeklyRefresh: raw answer saved to ${failedPath}`);
    } catch (saveErr) {
      context.warn("weeklyRefresh: could not save the raw answer.", saveErr);
    }
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
