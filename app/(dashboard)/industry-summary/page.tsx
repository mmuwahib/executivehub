import Link from "next/link";
import { Icon } from "@/lib/icons";
import { TONE_CHIP, TONE_TEXT } from "@/lib/tone";
import { getIndustrySummaryData } from "@/lib/api";
import PrintButton from "@/components/print-button";
import CountryBadge from "@/components/country-badge";
import { CompetitorCell } from "@/lib/types";

const TONE_BORDER_LEFT = {
  accent: "border-l-accent",
  cyan: "border-l-cyan",
  warning: "border-l-warning",
  danger: "border-l-danger",
  neutral: "border-l-ink-faint",
} as const;

const OPPORTUNITY_TIERS = ["Contested", "Moderate", "High"];

function Cell({ cell }: { cell: CompetitorCell }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${TONE_CHIP[cell.tone]}`}>
      {cell.value}
    </span>
  );
}

export default async function IndustrySummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; opportunity?: string }>;
}) {
  const { q, opportunity } = await searchParams;
  const { competitors, opportunities, whiteSpace } = await getIndustrySummaryData();

  const needle = q?.toLowerCase();

  const filteredCompetitors = competitors.filter((row) => {
    if (opportunity && row.gcOpportunity.value !== opportunity) return false;
    if (needle) return row.country.toLowerCase().includes(needle);
    return true;
  });

  const filteredOpportunities = needle
    ? opportunities.filter(
        (opp) => opp.country.toLowerCase().includes(needle) || opp.sector.toLowerCase().includes(needle)
      )
    : opportunities;

  const filteredWhiteSpace = needle
    ? whiteSpace.filter(
        (sector) => sector.title.toLowerCase().includes(needle) || sector.desc.toLowerCase().includes(needle)
      )
    : whiteSpace;

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-display-lg text-ink tracking-tight">Industry Summary</h1>
          <p className="text-ink-muted mt-1">Competitive landscape, growth opportunities & underserved sectors across the GCC.</p>
        </div>
      </div>

      {/* Competitor Matrix */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-headline-md text-ink flex items-center gap-3">
              <span className="w-1.5 h-6 bg-accent rounded-full" />
              Competitor Market Positioning Matrix
            </h2>
            <p className="text-sm text-ink-muted mt-1">Real-time competitive landscape across primary GCC operation clusters.</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1 p-1 bg-panel-highest border border-border rounded">
              <Link
                href="/industry-summary"
                className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                  !opportunity ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
                }`}
              >
                ALL
              </Link>
              {OPPORTUNITY_TIERS.map((tier) => (
                <Link
                  key={tier}
                  href={`/industry-summary?opportunity=${tier}`}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded uppercase ${
                    opportunity === tier ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
                  }`}
                >
                  {tier}
                </Link>
              ))}
            </div>
            <PrintButton
              label="EXPORT PDF"
              icon="download"
              className="px-4 py-1.5 bg-panel-highest border border-border text-ink font-mono text-[11px] rounded flex items-center gap-2"
            />
          </div>
        </div>
        <div className="glass-card rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-surface-low border-b border-border">
                <th className="p-5 font-mono text-label-caps text-ink-faint uppercase">Country</th>
                <th className="p-5 font-mono text-label-caps text-ink-faint uppercase text-center">Linde</th>
                <th className="p-5 font-mono text-label-caps text-ink-faint uppercase text-center">Air Products</th>
                <th className="p-5 font-mono text-label-caps text-ink-faint uppercase text-center">Air Liquide</th>
                <th className="p-5 font-mono text-label-caps text-ink-faint uppercase text-center">Messer</th>
                <th className="p-5 font-mono text-label-caps text-accent uppercase text-center">GC Opportunity</th>
              </tr>
            </thead>
            <tbody className="font-mono text-ticker-data">
              {filteredCompetitors.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-muted text-sm">
                    No results{q ? ` for "${q}"` : ""}.
                  </td>
                </tr>
              )}
              {filteredCompetitors.map((row) => (
                <tr key={row.country} className="border-b border-border hover:bg-accent/5 transition-colors group">
                  <td className="p-5 font-bold text-ink group-hover:text-accent">
                    <span className="inline-flex items-center gap-2">
                      <CountryBadge country={row.country} className="w-6 h-6 rounded bg-panel-high border border-border text-[9px] text-ink" /> {row.country}
                    </span>
                  </td>
                  <td className="p-5 text-center"><Cell cell={row.linde} /></td>
                  <td className="p-5 text-center"><Cell cell={row.airProducts} /></td>
                  <td className="p-5 text-center"><Cell cell={row.airLiquide} /></td>
                  <td className="p-5 text-center"><Cell cell={row.messer} /></td>
                  <td className="p-5 text-center"><Cell cell={row.gcOpportunity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Opportunity Radar */}
      <section className="mt-12">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Icon name="radar" size={28} className="text-accent" />
          <div>
            <h2 className="text-headline-md text-ink">Gulf Cryo Growth Opportunity Radar</h2>
            <p className="text-sm text-ink-muted">Strategic acquisition targets and underserved high-margin market entries.</p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 font-mono text-[10px] rounded">
              {filteredOpportunities.length} HIGH
            </span>
          </div>
        </div>
        {filteredOpportunities.length === 0 && (
          <div className="glass-card rounded p-8 text-center text-ink-muted text-sm">
            No results{q ? ` for "${q}"` : ""}.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
            <div key={opp.code} className="glass-card p-5 flex flex-col rounded relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <CountryBadge country={opp.country} className="w-10 h-10 rounded-lg text-xs bg-accent/20 border border-accent/30 text-accent" />
                  <div>
                    <h3 className="text-headline-sm text-ink">{opp.country}</h3>
                    <p className="text-[10px] font-mono text-ink-faint uppercase">{opp.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-accent font-bold uppercase tracking-wider">High</span>
                  <p className="font-mono text-ticker-data text-accent">{opp.score}/100</p>
                </div>
              </div>
              <p className="text-sm text-ink-muted flex-1">{opp.summary}</p>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-accent uppercase">Recommended Action</span>
                    <span className="text-ink-muted">{opp.actionUrgency}</span>
                  </div>
                  <p className="text-sm font-bold text-ink">{opp.action}</p>
                </div>
                <div className="bg-panel-highest h-1 w-full rounded-full overflow-hidden">
                  <div className="bg-accent h-full rounded-full" style={{ width: `${opp.progress}%` }} />
                </div>
                <span className="text-accent font-mono text-ticker-data block">{opp.potential}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* White Space Analysis */}
      <section className="mt-12">
        <h2 className="text-headline-sm text-ink flex items-center gap-2 mb-6">
          <Icon name="visibility" size={20} className="text-accent" />
          White Space Analysis — Underserved Sectors
        </h2>
        {filteredWhiteSpace.length === 0 && (
          <div className="glass-card rounded p-8 text-center text-ink-muted text-sm">
            No results{q ? ` for "${q}"` : ""}.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredWhiteSpace.map((sector) => (
            <div key={sector.title} className={`glass-card p-5 rounded border-l-4 ${TONE_BORDER_LEFT[sector.tone]}`}>
              <div className="flex justify-between items-center mb-3">
                <Icon name={sector.icon} size={20} className={TONE_TEXT[sector.tone]} />
                <span className={`font-mono text-[10px] px-2 rounded-full ${TONE_CHIP[sector.tone]}`}>
                  {sector.tier}
                </span>
              </div>
              <h4 className="text-headline-sm text-ink mb-2">{sector.title}</h4>
              <p className="text-sm text-ink-muted leading-relaxed">{sector.desc}</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[10px] font-mono text-ink-faint uppercase mb-1">GC Angle</p>
                <p className="text-sm text-ink font-semibold">{sector.angle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
