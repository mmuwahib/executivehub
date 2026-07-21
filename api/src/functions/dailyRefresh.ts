import { app, InvocationContext, Timer } from "@azure/functions";
import Anthropic from "@anthropic-ai/sdk";
import { writeJsonBlob } from "../blobStorage";
import { DailyDispatch } from "../types";

const DAILY_INTELLIGENCE_PROMPT = `You are an intelligence analyst for GulfCryo, an industrial gas company operating across 10 countries in the Middle East. Research today's most relevant geopolitical, market, energy, and business developments and return a single JSON object matching the DailyDispatch shape (date, generated_at, kpi, alerts, markets, energy, business, gulfcryo, strategic_alert, sources). Return ONLY the JSON object, no markdown, no commentary.`;

export async function dailyRefresh(myTimer: Timer, context: InvocationContext): Promise<void> {
  context.log("dailyRefresh triggered at", new Date().toISOString());

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    context.error("ANTHROPIC_API_KEY is not set. Skipping dailyRefresh.");
    return;
  }

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: DAILY_INTELLIGENCE_PROMPT }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    context.error("No text content returned from Claude.");
    return;
  }

  const dispatch = JSON.parse(textBlock.text) as DailyDispatch;
  const date = dispatch.date ?? new Date().toISOString().slice(0, 10);

  await writeJsonBlob(`daily/${date}.json`, dispatch);
  await writeJsonBlob("current-daily.json", dispatch);

  context.log(`dailyRefresh complete for ${date}`);
}

app.timer("dailyRefresh", {
  schedule: "0 0 3 * * *",
  handler: dailyRefresh,
});
