import { SourceRef } from "./types";

// Where a figure on the dashboard comes from, shown next to it so a reader
// can tell checked facts from judgement and placeholders.
//  - sourced:  live data linked to at least one article that passed the
//              source checks (approved outlet, working link, recent date)
//  - estimate: live data, but Claude's judgement with no supporting article
//  - sample:   placeholder content; no refresh has published this section
export type Provenance = "sourced" | "estimate" | "sample";

export const PROVENANCE_LABEL: Record<Provenance, string> = {
  sourced: "Sourced",
  estimate: "Estimate",
  sample: "Sample",
};

export const PROVENANCE_HELP: Record<Provenance, string> = {
  sourced: "From the latest refresh and linked to an article that passed the source checks.",
  estimate: "From the latest refresh, but Claude's judgement with no supporting article. Treat as indicative.",
  sample: "Placeholder content. No refresh has published real data for this yet.",
};

export function provenanceOf(
  item: { sourceUrl?: string; sources?: SourceRef[] } | undefined,
  live: boolean
): Provenance {
  if (!live) return "sample";
  if (item?.sourceUrl && item.sourceUrl !== "#") return "sourced";
  if (item?.sources && item.sources.length > 0) return "sourced";
  return "estimate";
}

// Section-level label for counts and charts that are never article-backed.
export function sectionProvenance(live: boolean): Provenance {
  return live ? "estimate" : "sample";
}
