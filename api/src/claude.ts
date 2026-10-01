import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 16000;
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
  const anthropic = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  const usage: ResearchUsage = { inputTokens: 0, outputTokens: 0, searches: 0, requests: 0, estimatedUsd: 0 };

  for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: maxSearches }],
      messages,
    });

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
      throw new Error(`unexpected stop_reason "${message.stop_reason}" (expected end_turn)`);
    }

    // Research commentary can precede the final JSON-only answer, so take the
    // last text block, not the first.
    const textBlocks = message.content.filter((block) => block.type === "text");
    const finalBlock = textBlocks[textBlocks.length - 1];
    if (!finalBlock) throw new Error("no text content returned from Claude");
    return { text: finalBlock.text, usage };
  }

  throw new Error(`still paused after ${MAX_CONTINUATIONS} continuations`);
}
