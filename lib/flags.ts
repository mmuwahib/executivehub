// ISO alpha-2 codes for country badges — flag emoji are unreliable (Windows/
// Chrome renders unsupported regional-indicator pairs as literal letter text,
// e.g. "AE" instead of a UAE flag glyph), so the app uses these directly as a
// deliberately-styled badge (see components/country-badge.tsx) instead of
// hoping the emoji glyph renders. Includes both short and formal names since
// the app uses both ("UAE" in the sidebar/mock data vs "United Arab Emirates"
// in territory rows).
export const COUNTRY_ISO: Record<string, string> = {
  UAE: "AE",
  "United Arab Emirates": "AE",
  "Saudi Arabia": "SA",
  KSA: "SA",
  Kuwait: "KW",
  Bahrain: "BH",
  Qatar: "QA",
  Oman: "OM",
  Jordan: "JO",
  Iraq: "IQ",
  Turkey: "TR",
  Egypt: "EG",
};

export function countryIso(country: string): string {
  if (COUNTRY_ISO[country]) return COUNTRY_ISO[country];
  const match = Object.keys(COUNTRY_ISO).find((name) => country.includes(name));
  return match ? COUNTRY_ISO[match] : country.slice(0, 2).toUpperCase();
}
