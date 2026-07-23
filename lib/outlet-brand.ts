import { Tone } from "./types";

// Visual identity per outlet — a 2-letter monogram + color, so source
// attribution reads as a quick badge instead of plain text.
const OUTLET_BRAND: Record<string, { initials: string; tone: Tone }> = {
  "Al Jazeera": { initials: "AJ", tone: "danger" },
  "Al Jazeera - Middle East": { initials: "AJ", tone: "danger" },
  "Khaleej Times": { initials: "KT", tone: "warning" },
  "Khaleej Times - UAE": { initials: "KT", tone: "warning" },
  "Arab News": { initials: "AN", tone: "accent" },
  "H2 View": { initials: "H2", tone: "cyan" },
  "H2 View Global": { initials: "H2", tone: "cyan" },
  "Renewables Now": { initials: "RN", tone: "accent" },
  Gasworld: { initials: "GW", tone: "neutral" },
  "Gasworld Fleet Insight": { initials: "GW", tone: "neutral" },
};

export function outletBrand(source: string): { initials: string; tone: Tone } {
  return OUTLET_BRAND[source] ?? { initials: source.slice(0, 2).toUpperCase(), tone: "neutral" };
}
