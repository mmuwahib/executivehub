// Real homepage URLs for known outlets referenced as "source" across the
// dashboard. Since article content in this app is mock/placeholder text (not
// live-fetched news), these link to each outlet's real homepage rather than a
// fabricated specific-article URL — accurate without overclaiming.
export const OUTLET_URLS: Record<string, string> = {
  "Al Jazeera": "https://www.aljazeera.com",
  "Al Jazeera - Middle East": "https://www.aljazeera.com",
  "Khaleej Times": "https://www.khaleejtimes.com",
  "Khaleej Times - UAE": "https://www.khaleejtimes.com",
  "Arab News": "https://www.arabnews.com",
  "H2 View": "https://www.h2-view.com",
  "H2 View Global": "https://www.h2-view.com",
  "Renewables Now": "https://www.renewablesnow.com",
  Gasworld: "https://www.gasworld.com",
  "Gasworld Fleet Insight": "https://www.gasworld.com",
};

export function outletUrl(source: string): string {
  return OUTLET_URLS[source] ?? "#";
}
