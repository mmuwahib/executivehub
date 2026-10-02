import Link from "next/link";
import { TONE_BG, TONE_CHIP } from "@/lib/tone";
import { getDashboardData, getIndustrySummaryData, getProjectTrackerData, getMarketTicker } from "@/lib/api";
import { SHOW_GEOPOLITICAL } from "@/lib/features";
import { safeUrl } from "@/lib/safe-url";
import { countryIso } from "@/lib/flags";
import LeadershipCard from "@/components/leadership-card";
import CountryBadge from "@/components/country-badge";
import CompetitorHeatmap from "@/components/competitor-heatmap";
import KpiBand from "@/components/kpi-band";
import Panel from "@/components/panel";
import InsightPopover from "@/components/insight-popover";
import { RADAR_TIER } from "@/lib/methodology";

const OPPORTUNITY_BAR: Record<string, string> = {
  HIGH: "bg-accent",
  MEDIUM: "bg-accent/60",
  EMERGING: "bg-accent/30",
};

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [dashboard, industry, tracker, ticker] = await Promise.all([
    getDashboardData(),
    getIndustrySummaryData(),
    getProjectTrackerData(),
    getMarketTicker(),
  ]);
  const { geoPulse, industryWeekly, leadershipMoves, marketSeries, projectHighlights, opportunityRadar } = dashboard;
  const kpis = SHOW_GEOPOLITICAL ? dashboard.kpis : dashboard.kpis.filter((kpi) => kpi.label !== "Geopolitical Risk");

  const needle = q?.toLowerCase();
  const filteredGeoPulse = needle ? geoPulse.filter((i) => i.title.toLowerCase().includes(needle)) : geoPulse;
  const filteredWeekly = needle
    ? industryWeekly.filter((i) => i.title.toLowerCase().includes(needle) || i.desc.toLowerCase().includes(needle))
    : industryWeekly;

  // Ticker lines that aren't already shown as a full market series row.
  const seriesKeys = marketSeries.map((s) => s.label.split(" ")[0].toUpperCase());
  const extraTicker = ticker.items
    .filter((t) => t.change !== undefined || /USD|AED|SAR/.test(t.label))
    .filter((t) => !seriesKeys.includes(t.label.split(" ")[0].toUpperCase()))
    .slice(0, 2);

  const maxProjects = Math.max(1, ...tracker.territories.map((t) => t.projects));

  return (
    <div className="flex flex-col gap-7">
      <KpiBand items={kpis} />

      {SHOW_GEOPOLITICAL && (
        <Panel title="Geopolitical pulse" aside={<span className="eyebrow">{filteredGeoPulse.length} items</span>}>
          <div className="flex flex-col divide-y divide-border">
            {filteredGeoPulse.map((item, i) => (
              <a key={i} href={safeUrl(item.sourceUrl)} target="_blank" rel="noopener noreferrer" className="py-3 flex gap-4 group">
                <span className={`self-start px-2 py-0.5 rounded font-mono text-[10px] ${item.tag === "WARNING" ? TONE_CHIP.danger : TONE_CHIP.accent}`}>
                  {item.tag}
                </span>
                <span className="flex-1 font-semibold text-ink group-hover:text-accent">{item.title}</span>
                <span className="text-[12px] text-ink-faint whitespace-nowrap">{item.source}</span>
              </a>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Panel
          className="lg:col-span-8"
          title="Competitive landscape"
          aside={
            <Link href="/industry-summary" className="text-[13px] font-semibold">
              Industry →
            </Link>
          }
        >
          <p className="-mt-3 text-[13px] text-ink-muted">Competitor strength by country, and where Gulf Cryo has room to grow</p>
          <CompetitorHeatmap rows={industry.competitors} />
        </Panel>

        <Panel
          id="market-data"
          className="lg:col-span-4 scroll-mt-24"
          title="Market movers"
          aside={<span className={`eyebrow ${ticker.live ? "text-positive" : "text-warning"}`}>{ticker.live ? "Live" : "Sample"}</span>}
        >
          <div className="flex flex-col divide-y divide-border -my-2">
            {marketSeries.map((series) => {
              const up = series.direction === "up";
              const down = series.direction === "down";
              return (
                <div key={series.label} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="eyebrow truncate">{series.label}</span>
                    <span className="text-xl font-bold text-ink">{series.value}</span>
                  </div>
                  <div className="h-8 flex items-end gap-1" aria-hidden="true">
                    {series.bars.map((h, i) => (
                      <span
                        key={i}
                        className={`w-1.5 rounded-sm ${up ? "bg-positive" : down ? "bg-danger" : "bg-ink-faint"}`}
                        style={{ height: `${Math.max(8, h)}%`, opacity: i === series.bars.length - 1 ? 1 : 0.35 }}
                      />
                    ))}
                  </div>
                  <span
                    className={`min-w-[60px] text-center px-2 py-1 rounded-md font-mono text-[12px] font-semibold ${
                      up ? "bg-positive/15 text-positive" : down ? "bg-danger/15 text-danger" : "bg-panel-highest text-ink-muted"
                    }`}
                  >
                    {series.change}
                  </span>
                </div>
              );
            })}
            {extraTicker.map((item) => (
              <div key={item.label} className="py-3 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="eyebrow">{item.label}</span>
                  <span className="text-xl font-bold text-ink">{item.value}</span>
                </div>
                <span
                  className={`min-w-[60px] text-center px-2 py-1 rounded-md font-mono text-[12px] font-semibold ${
                    item.direction === "up"
                      ? "bg-positive/15 text-positive"
                      : item.direction === "down"
                        ? "bg-danger/15 text-danger"
                        : "bg-panel-highest text-ink-muted"
                  }`}
                >
                  {item.change ?? "PEG"}
                </span>
              </div>
            ))}
          </div>
          {!ticker.live && (
            <p className="text-[12px] text-ink-faint">Sample values until a market data provider is connected.</p>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Panel className="lg:col-span-5" title="Executive moves" aside={<span className="eyebrow">Competitor leadership</span>}>
          {leadershipMoves.length === 0 ? (
            <p className="text-sm text-ink-muted">No new competitor appointments in the last 30 days.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {leadershipMoves.map((appointment, i) => (
                <LeadershipCard key={i} appointment={appointment} />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          className="lg:col-span-4"
          title="Industrial gas weekly"
          aside={
            <Link href="/tech-innovation" className="text-[13px] font-semibold">
              More →
            </Link>
          }
        >
          <div className="flex flex-col divide-y divide-border -my-3">
            {filteredWeekly.length === 0 && <p className="py-3 text-sm text-ink-muted">No results for &ldquo;{q}&rdquo;.</p>}
            {filteredWeekly.slice(0, 5).map((item, i) => (
              <a key={i} href={safeUrl(item.sourceUrl)} target="_blank" rel="noopener noreferrer" className="py-3 flex flex-col gap-1 group">
                <span className="flex justify-between gap-3 eyebrow">
                  <span className="text-positive">
                    {item.tag} · {item.region}
                  </span>
                  <span>{item.source}</span>
                </span>
                <span className="text-[15px] font-semibold leading-snug text-ink group-hover:text-accent">{item.title}</span>
                <span className="text-[13px] text-ink-muted line-clamp-2">{item.desc}</span>
              </a>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-3" title="Opportunity radar">
          <div className="flex flex-col gap-4">
            {opportunityRadar.map((entry) => (
              <div key={`${entry.code}-${entry.sector}`} className="flex items-center gap-3">
                <CountryBadge country={entry.country} className="w-9 h-9 rounded-lg bg-panel-high border border-border-strong text-[11px] text-ink" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="font-semibold text-ink">{entry.country}</span>
                  <span className="text-[12px] text-ink-muted line-clamp-2">{entry.sector}</span>
                </div>
                <InsightPopover
                  insight={{
                    heading: `${entry.country} · ${entry.sector}: ${entry.tier}`,
                    definition: RADAR_TIER[entry.tier],
                    basis: entry.basis,
                    sources: entry.sources,
                  }}
                  label={`Why ${entry.country} is rated ${entry.tier}`}
                  className={`font-mono text-[11px] font-semibold uppercase rounded px-1 underline decoration-dotted underline-offset-2 ${entry.tier === "High" ? "text-accent" : "text-ink-muted"}`}
                >
                  {entry.tier}
                </InsightPopover>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Panel
          className="lg:col-span-8"
          title="Flagship pipeline"
          aside={
            <Link href="/project-tracker" className="text-[13px] font-semibold">
              All projects →
            </Link>
          }
        >
          <div className="grid grid-cols-[minmax(0,240px)_minmax(0,1fr)_56px] gap-x-5 gap-y-4 items-center">
            {projectHighlights.map((project) => (
              <div key={project.title} className="contents">
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-ink truncate">{project.title}</span>
                  <span className="text-[13px] text-ink-muted truncate">{project.location}</span>
                </div>
                <div className="h-3 rounded-full bg-panel-highest">
                  <div className={`h-3 rounded-full ${TONE_BG[project.tone]}`} style={{ width: `${project.progress}%` }} />
                </div>
                <span className="font-mono font-semibold text-right text-ink">{project.progress}%</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-4" title="Projects by territory" aside={<span className="eyebrow">Active count</span>}>
          <div className="grid gap-2.5 items-end h-36" style={{ gridTemplateColumns: `repeat(${tracker.territories.length}, minmax(0, 1fr))` }}>
            {tracker.territories.map((t) => (
              <div key={t.country} className="flex flex-col items-center justify-end gap-1.5 h-36">
                <span className="font-mono text-[12px] font-semibold text-ink">{t.projects}</span>
                <div
                  className={`w-full rounded-t-md rounded-b-sm ${OPPORTUNITY_BAR[t.opportunity] ?? "bg-accent/40"}`}
                  style={{ height: `${Math.max(6, (t.projects / maxProjects) * 100)}px` }}
                  title={`${t.country}: ${t.projects} projects, ${t.opportunity} opportunity`}
                />
              </div>
            ))}
          </div>
          <div className="grid gap-2.5 -mt-3" style={{ gridTemplateColumns: `repeat(${tracker.territories.length}, minmax(0, 1fr))` }}>
            {tracker.territories.map((t) => (
              <span key={t.country} className="font-mono text-[11px] text-ink-muted text-center">
                {countryIso(t.country)}
              </span>
            ))}
          </div>
          <p className="text-[12px] text-ink-faint">Bright = high opportunity · mid = medium · dim = emerging</p>
        </Panel>
      </div>
    </div>
  );
}
