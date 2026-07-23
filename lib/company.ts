import { Tone } from "./types";

// Consistent color identity per competitor, reusing the existing Tone system
// rather than introducing new one-off hex values.
export const COMPANY_TONE: Record<string, Tone> = {
  Linde: "cyan",
  "Air Products": "warning",
  "Air Liquide": "accent",
  Messer: "neutral",
};

export function companyTone(company: string): Tone {
  return COMPANY_TONE[company] ?? "neutral";
}
