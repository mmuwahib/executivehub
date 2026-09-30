// Outlets the refresh functions are allowed to publish links from. This is the
// one place to manage live sources: add a domain here to allow a new outlet,
// remove one to stop publishing links from it. Any item whose sourceUrl host
// is not listed is dropped before it reaches Blob Storage (see validation.ts),
// and the same list is given to Claude in the prompt so the two stay in sync.
//
// Reuters is deliberately absent (business decision, see dailyRefresh prompt).
export const ALLOWED_SOURCE_DOMAINS: readonly string[] = [
  // Regional / Gulf news
  "aljazeera.com",
  "khaleejtimes.com",
  "arabnews.com",
  "gulfnews.com",
  "thenationalnews.com",
  "saudigazette.com",
  "zawya.com",
  "argaam.com",
  // Industrial gas, hydrogen, energy trade press
  "gasworld.com",
  "h2-view.com",
  "hydrogeninsight.com",
  "renewablesnow.com",
  "argusmedia.com",
  "spglobal.com",
  "offshore-technology.com",
  "power-technology.com",
];

export function isAllowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ALLOWED_SOURCE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function allowedDomainsForPrompt(): string {
  return ALLOWED_SOURCE_DOMAINS.join(", ");
}
