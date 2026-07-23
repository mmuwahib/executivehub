import { countryIso } from "@/lib/flags";

// Bordered square chip showing a country's ISO code. Replaces raw flag emoji
// everywhere — Windows/Chrome renders unsupported flag glyphs as literal
// two-letter text (confirmed on this app's own risk map), so a deliberately
// styled code badge is more reliable than hoping the emoji renders.
export default function CountryBadge({
  country,
  className = "w-7 h-7 rounded bg-panel-high border border-border text-[10px] text-ink",
}: {
  country: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center justify-center font-bold font-mono shrink-0 ${className}`}>
      {countryIso(country)}
    </span>
  );
}
