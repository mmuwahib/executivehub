import { app, InvocationContext, Timer } from "@azure/functions";
import { writeJsonBlob } from "../blobStorage";
import { MarketsData } from "../types";

async function fetchMarketData(): Promise<MarketsData> {
  const apiUrl = process.env.MARKET_API_URL;
  const apiKey = process.env.MARKET_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      "MARKET_API_URL / MARKET_API_KEY are not configured. Plug in the real market data provider here."
    );
  }

  const response = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`Market data API responded with ${response.status}`);
  }

  const data = await response.json();

  // TODO: map the provider's response shape into MarketSeries[]/TickerItem[]
  // once the real market data API is selected.
  return {
    generated_at: new Date().toISOString(),
    marketSeries: data.marketSeries ?? [],
    ticker: data.ticker ?? [],
  };
}

export async function marketRefresh(myTimer: Timer, context: InvocationContext): Promise<void> {
  context.log("marketRefresh triggered at", new Date().toISOString());

  try {
    const data = await fetchMarketData();
    await writeJsonBlob("markets-latest.json", data);
    context.log("marketRefresh complete");
  } catch (err) {
    context.error("marketRefresh failed:", err);
  }
}

app.timer("marketRefresh", {
  schedule: "0 */30 6-10 * * 0-4",
  handler: marketRefresh,
});
