import { app, InvocationContext, Timer } from "@azure/functions";
import Anthropic from "@anthropic-ai/sdk";
import { writeJsonBlob } from "../blobStorage";
import { WeeklyDispatch } from "../types";

const WEEKLY_INTELLIGENCE_PROMPT = `You are an intelligence analyst for GulfCryo. Research this week's industrial gas industry developments (M&A, leadership, market activity) and regional infrastructure projects relevant to ATC (Application Technology Center — Saudi Aramco / Gulf Cryo at SPARK). Return a single JSON object matching the WeeklyDispatch shape (industry: AlertItem[], projects: ProjectItem[]). Return ONLY the JSON object, no markdown, no commentary.`;

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    context.error("ANTHROPIC_API_KEY is not set. Skipping weeklyRefresh.");
    return;
  }

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: WEEKLY_INTELLIGENCE_PROMPT }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    context.error("No text content returned from Claude.");
    return;
  }

  const dispatch = JSON.parse(textBlock.text) as WeeklyDispatch;
  const week = getIsoWeek(new Date());

  await writeJsonBlob(`weekly/${week}.json`, dispatch);
  await writeJsonBlob("current-weekly.json", dispatch);

  context.log(`weeklyRefresh complete for ${week}`);
}

app.timer("weeklyRefresh", {
  schedule: "0 0 3 * * 0",
  handler: weeklyRefresh,
});
