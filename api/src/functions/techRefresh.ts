import { app, InvocationContext, Timer } from "@azure/functions";
import { readJsonBlob, writeJsonBlob } from "../blobStorage";
import { researchJson, formatUsage, skipLocalRefresh, ResearchError, parseJsonAnswer } from "../claude";
import { TechData, WeeklyData } from "../types";
import { allowedDomainsForPrompt } from "../outlets";
import { validateTech, TECH_TOPICS, MAX_PER_OUTLET } from "../validation";
import { getIsoWeek } from "../week";

// Tech & innovation articles only — split out of the weekly run so a slow or
// stale tech search can't delay or block the industry and project analysis.
const TECH_PROMPT = `You are a technology analyst for GulfCryo, an industrial gas company operating across 10 countries in the Middle East.

Use the web_search tool to find this month's most relevant technology news on hydrogen, renewables, carbon capture (CCS/CCU) and industrial-gas innovation, with genuine regional spread (MENA, Europe, ASEAN, Americas). Put the current month and year in your search queries. Every article must be a real story you actually found; do not invent articles, figures or quotes.

Respond with a single JSON object (no markdown, no commentary) matching this exact shape:

{
  "techArticles": [ { "tag": "${TECH_TOPICS.join("|")}", "tone": "accent|cyan|warning", "time": "...", "title": "...", "desc": "...", "source": "...", "sourceUrl": "https://exact-article-url-from-search", "publishedAt": "YYYY-MM-DD", "size": "featured|wide|standard|half", "icon": "material-symbol-name", "region": "MENA|Europe|ASEAN|Americas" } ]
}

Rules (items breaking them are discarded automatically):
- Return 5–7 articles. Make exactly one "featured".
- "tag" is exactly one of: ${TECH_TOPICS.join(", ")}.
- At most ${MAX_PER_OUTLET} articles from any one outlet; spread the rest across different outlets.
- "publishedAt" is the real publication date from the page or search result, within the last 21 days. No background, company-profile or announcement pieces from earlier years.
- "sourceUrl" is the exact URL of the specific article, from these domains only: ${allowedDomainsForPrompt()}. Not a homepage, not fabricated. Do not use Reuters.

Your FINAL message must contain ONLY the JSON object and nothing else.`;

export async function techRefresh(myTimer: Timer, context: InvocationContext): Promise<void> {
  context.log("techRefresh triggered at", new Date().toISOString());

  if (skipLocalRefresh()) {
    context.warn("techRefresh skipped: running locally and ALLOW_LOCAL_REFRESH is not 'true' (avoids spending API credit on host restarts).");
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    context.error("ANTHROPIC_API_KEY is not set. Skipping techRefresh.");
    return;
  }

  let text: string;
  try {
    const research = await researchJson(apiKey, TECH_PROMPT, 6, (m) => context.log(`techRefresh: ${m}`));
    text = research.text;
    context.log(`techRefresh usage: ${formatUsage(research.usage)}`);
  } catch (err) {
    context.error("techRefresh: research call failed; keeping previous data.", err);
    if (err instanceof ResearchError) context.warn(`techRefresh usage (failed run): ${formatUsage(err.usage)}`);
    return;
  }

  let parsed: unknown;
  try {
    parsed = parseJsonAnswer(text);
  } catch (err) {
    context.error("Claude's final response was not valid JSON:", text.slice(0, 500), err);
    // Keep the paid answer so it can be inspected or recovered by hand.
    const failedPath = `failed/techRefresh-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    try {
      await writeJsonBlob(failedPath, { error: String(err), raw: text });
      context.warn(`techRefresh: raw answer saved to ${failedPath}`);
    } catch (saveErr) {
      context.warn("techRefresh: could not save the raw answer.", saveErr);
    }
    return;
  }

  // Previous set for the fallback: the tech blob, or (before the first tech
  // run) the tech articles the old combined weekly run published.
  let previous: TechData["techArticles"] | null = null;
  try {
    previous =
      (await readJsonBlob<TechData>("current-tech.json"))?.techArticles ??
      (await readJsonBlob<WeeklyData>("current-weekly.json"))?.techArticles ??
      null;
  } catch (err) {
    context.warn("techRefresh: could not read the previous tech articles; no fallback this run.", err);
  }

  const result = await validateTech(parsed, {}, previous);
  for (const drop of result.drops) {
    context.warn(`techRefresh dropped ${drop.where}: ${drop.reason} (${drop.url})`);
  }
  if (!result.ok) {
    context.error(`techRefresh rejected the run, keeping previous data: ${result.reason}`);
    return;
  }
  const week = getIsoWeek(new Date());

  await writeJsonBlob(`tech/${week}.json`, result.data);
  await writeJsonBlob("current-tech.json", result.data);

  context.log(`techRefresh complete for ${week} (${result.data.techArticles.length} articles)`);
}

app.timer("techRefresh", {
  schedule: "0 0 4 * * 0",
  handler: techRefresh,
});
