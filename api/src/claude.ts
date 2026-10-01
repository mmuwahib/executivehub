import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";
// The weekly JSON hit 16k output tokens in testing; responses are streamed,
// so a higher ceiling carries no request-timeout risk.
const MAX_TOKENS = 32000;
const MAX_CONTINUATIONS = 5;

// Rough list prices used only for the cost estimate in the logs (USD).
const USD_PER_MTOK_INPUT = 3;
const USD_PER_MTOK_OUTPUT = 15;
const USD_PER_SEARCH = 0.01;

export interface ResearchUsage {
  inputTokens: number;
  outputTokens: number;
  searches: number;
  requests: number;
  estimatedUsd: number;
}

export interface ResearchResult {
  text: string;
  usage: ResearchUsage;
}

// Thrown when a run fails after spending tokens, so callers can still log
// what the failed attempt cost.
export class ResearchError extends Error {
  constructor(message: string, readonly usage: ResearchUsage) {
    super(message);
    this.name = "ResearchError";
  }
}

// Timers fire when the Functions host starts locally, and every run spends
// real Anthropic credit. Outside Azure (WEBSITE_SITE_NAME unset) refreshes are
// skipped unless ALLOW_LOCAL_REFRESH=true in local.settings.json.
export function skipLocalRefresh(): boolean {
  const inAzure = Boolean(process.env.WEBSITE_SITE_NAME);
  return !inAzure && process.env.ALLOW_LOCAL_REFRESH !== "true";
}

export function formatUsage(u: ResearchUsage): string {
  return (
    `${u.requests} API call(s), ${u.inputTokens} input + ${u.outputTokens} output tokens, ` +
    `${u.searches} web searches, est. $${u.estimatedUsd.toFixed(2)}`
  );
}

// Runs one research prompt with the server-side web_search tool and returns
// the text of Claude's final message plus token/search usage. Long searches can
// stop with "pause_turn"; the documented way to resume is to send the paused
// assistant turn back, so this loops (bounded) instead of treating it as a
// failure. Throws on API errors, truncation, or an empty answer so callers
// keep the previous published data.
export async function researchJson(apiKey: string, prompt: string, maxSearches: number): Promise<ResearchResult> {
  // A research run with web search took 14–15 minutes in testing. The
  // Function App's own limit is functionTimeout in host.json (30 min).
  const anthropic = new Anthropic({ apiKey, timeout: 25 * 60 * 1000 });
  // Without today's date, "this week" / "last 7 days" have no anchor and the
  // model returned articles 3–22 months old in testing.
  const today = new Date().toISOString().slice(0, 10);
  const datedPrompt =
    `Today's date is ${today}. Only use articles published recently relative to this date, ` +
    `and include the month and year in your search queries.\n\n${prompt}`;
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: datedPrompt }];
  const usage: ResearchUsage = { inputTokens: 0, outputTokens: 0, searches: 0, requests: 0, estimatedUsd: 0 };

  for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
    // Streamed, not a single blocking request: a research run can take 15+
    // minutes and a silent long-lived connection gets dropped ("Request timed
    // out" at ~15 min in testing). finalMessage() still returns one Message.
    const message = await anthropic.messages
      .stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: maxSearches }],
        messages,
      })
      .finalMessage();

    usage.requests += 1;
    usage.inputTokens += message.usage.input_tokens;
    usage.outputTokens += message.usage.output_tokens;
    usage.searches += message.usage.server_tool_use?.web_search_requests ?? 0;
    usage.estimatedUsd =
      (usage.inputTokens / 1e6) * USD_PER_MTOK_INPUT +
      (usage.outputTokens / 1e6) * USD_PER_MTOK_OUTPUT +
      usage.searches * USD_PER_SEARCH;

    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: message.content });
      continue;
    }

    if (message.stop_reason !== "end_turn") {
      throw new ResearchError(`unexpected stop_reason "${message.stop_reason}" (expected end_turn)`, usage);
    }

    // Research commentary can precede the final JSON-only answer, so take the
    // last text block, not the first.
    const textBlocks = message.content.filter((block) => block.type === "text");
    const finalBlock = textBlocks[textBlocks.length - 1];
    if (!finalBlock) throw new ResearchError("no text content returned from Claude", usage);
    return { text: finalBlock.text, usage };
  }

  throw new ResearchError(`still paused after ${MAX_CONTINUATIONS} continuations`, usage);
}
