import { getIndustrySummaryData } from "@/lib/api";
import PrintButton from "@/components/print-button";
import CompetitorHeatmap from "@/components/competitor-heatmap";
import PageHeader from "@/components/page-header";
import FilterChips from "@/components/filter-chips";
import Panel from "@/components/panel";
import InsightPopover from "@/components/insight-popover";
import { OPPORTUNITY_SCORE, WHITE_SPACE_TIER } from "@/lib/methodology";
import { Tone } from "@/lib/types";

const OPPORTUNITY_TIERS = ["High", "Moderate", "Contested"];

const TIER_CHIP: Record<Tone, string> = {
  accent: "bg-accent/20 text-accent",
  cyan: "bg-cyan/15 text-cyan",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  neutral: "bg-panel-highest text-ink-muted",
};

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
    ? opportunities.filter((o) => o.country.toLowerCase().includes(needle) || o.sector.toLowerCase().includes(needle))
    : opportunities;
  const filteredWhiteSpace = needle
    ? whiteSpace.filter((s) => s.title.toLowerCase().includes(needle) || s.desc.toLowerCase().includes(needle))
    : whiteSpace;
  const rankedOpportunities = [...filteredOpportunities].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Weekly · updated Sunday"
        title="Industry summary"
        description="Competitor strength, growth opportunities and white space across Gulf Cryo's 10 countries"
        actions={<PrintButton label="Export PDF" />}
      />

      <Panel
        title="Competitive landscape"
        aside={
          <FilterChips
            label="GC opening"
            chips={[
              { label: "All", href: "/industry-summary", active: !opportunity },
              ...OPPORTUNITY_TIERS.map((tier) => ({
                label: tier,
                href: `/industry-summary?opportunity=${tier}`,
                active: opportunity === tier,
              })),
            ]}
          />
        }
      >
        {filteredCompetitors.length === 0 ? (
          <p className="text-sm text-ink-muted">No countries match{q ? ` "${q}"` : " this filter"}.</p>
        ) : (
          <CompetitorHeatmap rows={filteredCompetitors} />
        )}
      </Panel>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-baseline">
          <h2 className="m-0 text-xl font-bold text-ink">Growth opportunities</h2>
          <span className="text-[13px] text-ink-muted">Ranked by opportunity score</span>
        </div>
        {rankedOpportunities.length === 0 && <p className="text-sm text-ink-muted">No results{q ? ` for "${q}"` : ""}.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rankedOpportunities.map((opp) => {
            const immediate = opp.actionUrgency.toUpperCase().startsWith("IMMEDIATE");
            return (
              <article key={`${opp.code}-${opp.sector}`} className="glass-card rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-ink">{opp.country}</span>
                    <span className="text-[13px] text-ink-muted">{opp.sector}</span>
                  </div>
                  <InsightPopover
                    insight={{
                      heading: `${opp.country} · ${opp.sector}: ${opp.score}/100`,
                      definition: OPPORTUNITY_SCORE,
                      basis: opp.basis,
                      sources: opp.sources,
                    }}
                    label={`How the ${opp.country} score of ${opp.score} was reached`}
                    className="flex flex-col items-end rounded-md px-1.5 py-1 hover:bg-panel-high"
                  >
                    <span className="text-[34px] font-extrabold leading-none text-accent">{opp.score}</span>
                    <span className="eyebrow text-[10px] underline decoration-dotted underline-offset-2">Score · why</span>
                  </InsightPopover>
                </div>
                <p className="m-0 text-sm text-ink-muted">{opp.summary}</p>
                <div className="rounded-lg bg-panel-high p-3 flex flex-col gap-1">
                  <span className={`eyebrow font-semibold ${immediate ? "text-warning" : "text-accent"}`}>
                    {opp.actionUrgency} action
                  </span>
                  <span className="text-sm font-semibold text-ink">{opp.action}</span>
                </div>
                <div className="mt-auto flex flex-col gap-1.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-ink-muted">{opp.potential}</span>
                    <span className="font-mono text-ink">{opp.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-panel-highest">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${opp.progress}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-xl font-bold text-ink">White-space sectors</h2>
        {filteredWhiteSpace.length === 0 && <p className="text-sm text-ink-muted">No results{q ? ` for "${q}"` : ""}.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {filteredWhiteSpace.map((sector) => (
            <article key={sector.title} className="glass-card rounded-xl p-5 flex flex-col gap-2.5">
              <InsightPopover
                insight={{
                  heading: `${sector.title}: ${sector.tier}`,
                  definition: WHITE_SPACE_TIER[sector.tier],
                  basis: sector.basis,
                  sources: sector.sources,
                }}
                label={`Why ${sector.title} is rated ${sector.tier}`}
                className={`self-start font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md underline decoration-dotted underline-offset-2 ${TIER_CHIP[sector.tone]}`}
              >
                {sector.tier}
              </InsightPopover>
              <span className="text-[17px] font-bold text-ink">{sector.title}</span>
              <span className="text-sm text-ink-muted">{sector.desc}</span>
              <span className="mt-auto pt-2.5 border-t border-border text-[13px] text-accent">GC angle: {sector.angle}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
