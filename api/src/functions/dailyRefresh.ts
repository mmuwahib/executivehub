import { app, InvocationContext, Timer } from "@azure/functions";
import Anthropic from "@anthropic-ai/sdk";
import { writeJsonBlob } from "../blobStorage";
import { DailyData } from "../types";

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
    "geoPulse": [ { "tag": "WARNING|MONITOR", "title": "...", "source": "...", "sourceUrl": "https://real-outlet-homepage...", "time": "..." } ],
    "industryWeekly": [ { "tag": "...", "tone": "accent|cyan|warning|danger|neutral", "title": "...", "desc": "...", "source": "...", "sourceUrl": "https://real-outlet-homepage...", "region": "MENA|Europe|ASEAN|Americas" } ],
    "leadershipMoves": [ { "company": "Linde|Air Products|Air Liquide|Messer|...", "initials": "2-letter", "role": "...", "region": "MENA|Europe|ASEAN|Americas", "desc": "...", "source": "...", "sourceUrl": "https://real-outlet-homepage..." } ],
    "projectHighlights": [ { "title": "...", "location": "...", "progress": 0-100, "tone": "..." } ],
    "opportunityRadar": [ { "code": "2-letter country code", "country": "...", "sector": "...", "tier": "High|Moderate", "potential": "..." } ]
  },
  "geopolitical": {
    "hotZone": { "name": "...", "coords": "...", "detail": "..." },
    "riskRegions": [ { "name": "...", "pct": 0-100, "tone": "..." } ],
    "criticalIncident": { "title": "...", "desc": "...", "time": "...", "source": "...", "sourceUrl": "https://real-outlet-homepage..." },
    "articles": [ { "tag": "WARNING|MONITOR", "region": "...", "time": "...", "title": "...", "desc": "...", "source": "...", "sourceUrl": "https://real-outlet-homepage..." } ]
  }
}

IMPORTANT: "sourceUrl" must be the exact, real URL of the specific article you found via web_search — not the outlet's homepage, and not a fabricated URL. Every sourceUrl must come directly from a search result you actually retrieved.

IMPORTANT: Do not use Reuters as a source. Pick the real English-language outlet native to the story's own country: Khaleej Times only for UAE-datelined stories, Arab News for Saudi Arabia-datelined stories, Al Jazeera for pan-regional or cross-border stories with no single-country angle. Never use an outlet from a different country than the story it's attached to.

Your FINAL message must contain ONLY the JSON object and nothing else — no preamble, no summary of your research process, no markdown code fences, no text before or after it.`;

export async function dailyRefresh(myTimer: Timer, context: InvocationContext): Promise<void> {
  context.log("dailyRefresh triggered at", new Date().toISOString());

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    context.error("ANTHROPIC_API_KEY is not set. Skipping dailyRefresh.");
    return;
  }

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 12 }],
    messages: [{ role: "user", content: DAILY_INTELLIGENCE_PROMPT }],
  });

  if (message.stop_reason !== "end_turn") {
    context.warn(`dailyRefresh: unexpected stop_reason "${message.stop_reason}" — response may be incomplete.`);
  }

  // With web search enabled, Claude may write research commentary in earlier
  // text blocks before its final JSON-only answer — take the last one, not the first.
  const textBlocks = message.content.filter((block) => block.type === "text");
  const finalBlock = textBlocks[textBlocks.length - 1];
  if (!finalBlock) {
    context.error("No text content returned from Claude.");
    return;
  }

  let data: DailyData;
  try {
    data = JSON.parse(finalBlock.text) as DailyData;
  } catch (err) {
    context.error("Claude's final response was not valid JSON:", finalBlock.text.slice(0, 500), err);
    return;
  }

  const date = new Date().toISOString().slice(0, 10);

  await writeJsonBlob(`daily/${date}.json`, data);
  await writeJsonBlob("current-daily.json", data);

  context.log(`dailyRefresh complete for ${date}`);
}

app.timer("dailyRefresh", {
  schedule: "0 0 3 * * *",
  handler: dailyRefresh,
});
