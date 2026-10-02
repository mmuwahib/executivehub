// Mirror of api/src/methodology.ts (the rating scale the refresh prompts give
// Claude). The two projects don't share a package — keep both in sync.

export const COMPETITOR_STRENGTH: Record<string, string> = {
  Dominant:
    "Market leader in that country: own large-scale production (air separation units or plants) and pipeline or on-site supply to the main industrial clusters.",
  Strong: "Significant own production or major long-term supply contracts, but not the clear market leader.",
  Active: "Present through distribution, smaller plants, joint ventures or partners; competes for some of the business.",
  Limited: "Little or no local production; serves the market through imports, agents or occasional projects.",
};

export const GC_OPENING: Record<string, string> = {
  High: "No dominant competitor, and demand is growing in sectors Gulf Cryo serves.",
  Moderate: "Room in some sectors or segments, but at least one strong competitor is present.",
  Contested: "A dominant or strong competitor holds the main sectors.",
};

export const OPPORTUNITY_SCORE =
  "0–100 score weighing four factors: demand growth in the sector, the gap left by competitors, Gulf Cryo's existing footprint and logistics, and near-term projects that need industrial gases.";

export const RADAR_TIER: Record<string, string> = {
  High: "Strong demand signal with a clear gap Gulf Cryo can serve in the near term.",
  Moderate: "Real demand, but competition or timing make it a slower or smaller opportunity.",
};

export const WHITE_SPACE_TIER: Record<string, string> = {
  HIGH: "Fragmented or under-served sector with large, near-term demand Gulf Cryo can address.",
  MEDIUM: "Some structured competition or smaller demand; worth targeted entry.",
  EMERGING: "Niche or early-stage demand that could grow; watch and position.",
};

export const KPI_NOTE = "Headline figure from the latest refresh, judged from the articles Claude found that day.";
