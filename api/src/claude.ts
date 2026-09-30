import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 16000;
const MAX_CONTINUATIONS = 5;

// Runs one research prompt with the server-side web_search tool and returns
// the text of Claude's final message. Long searches can stop with
// "pause_turn"; the documented way to resume is to send the paused assistant
// turn back, so this loops (bounded) instead of treating it as a failure.
// Throws on API errors, truncation, or an empty answer so callers keep the
// previous published data.
export async function researchJson(apiKey: string, prompt: string, maxSearches: number): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: maxSearches }],
      messages,
    });

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
    return finalBlock.text;
  }

  throw new Error(`still paused after ${MAX_CONTINUATIONS} continuations`);
}
