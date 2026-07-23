import Link from "next/link";
import { Icon } from "@/lib/icons";
import { TONE_TEXT, TONE_BG, TONE_CHIP, REGION_TONE, TONE_BORDER_TOP } from "@/lib/tone";
import { getDashboardData } from "@/lib/api";
import LeadershipCard from "@/components/leadership-card";
import VisualTile from "@/components/visual-tile";
import SourceBadge from "@/components/source-badge";
import CountryBadge from "@/components/country-badge";

export default async function MainDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { kpis, geoPulse, industryWeekly, leadershipMoves, marketSeries, projectHighlights, opportunityRadar } = await getDashboardData();

  const needle = q?.toLowerCase();
  const filteredGeoPulse = needle
    ? geoPulse.filter((item) => item.title.toLowerCase().includes(needle))
    : geoPulse;
  const filteredIndustryWeekly = needle
    ? industryWeekly.filter(
        (item) => item.title.toLowerCase().includes(needle) || item.desc.toLowerCase().includes(needle)
      )
    : industryWeekly;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* KPI Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`glass-card p-card rounded border-t-2 ${TONE_BORDER_TOP[kpi.tone]}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] text-ink-faint uppercase tracking-wider">
                {kpi.label}
              </span>
              <Icon name={kpi.icon} size={20} className={TONE_TEXT[kpi.tone]} />
            </div>
            <div className="text-[32px] font-bold text-ink leading-tight mb-1">{kpi.value}</div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full ${TONE_BG[kpi.tone]}`} />
              <span className="text-ink-muted">{kpi.delta}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section className="glass-card rounded flex flex-col">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-panel-high/20">
              <div className="flex items-center gap-2">
                <Icon name="analytics" size={20} className="text-accent" />
                <h2 className="text-headline-sm text-ink">Daily Geopolitical Pulse</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-2 py-0.5 bg-accent/10 border border-accent/20 rounded">
                  <span className="font-mono text-[10px] text-accent">{filteredGeoPulse.length} LIVE</span>
                </div>
                <Link href="/geopolitical" className="font-mono text-[11px] text-accent hover:underline">
                  FULL FEED →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {filteredGeoPulse.length === 0 && (
                <div className="p-8 text-center text-ink-muted text-sm">No results for &ldquo;{q}&rdquo;.</div>
              )}
              {filteredGeoPulse.map((item, i) => (
                <a
                  key={i}
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 flex gap-4 hover:bg-ink/5 transition-colors group"
                >
                  <div className="mt-1">
                    <span
                      className={`px-2 py-1 font-mono text-[10px] uppercase tracking-tighter rounded ${
                        item.tag === "WARNING" ? TONE_CHIP.danger : TONE_CHIP.accent
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 font-mono text-[11px] text-ink-faint">
                      <SourceBadge source={item.source} />
                      <span className="flex items-center gap-1">{item.time}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="glass-card rounded flex flex-col">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-panel-high/20">
              <div className="flex items-center gap-2">
                <Icon name="factory" size={20} className="text-accent" />
                <h2 className="text-headline-sm text-ink">Industrial Gas Weekly</h2>
              </div>
              <Link href="/industry-summary" className="font-mono text-[11px] text-ink-muted hover:text-ink">
                ARCHIVE →
              </Link>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredIndustryWeekly.length === 0 && (
                <div className="md:col-span-2 text-center text-ink-muted text-sm py-4">
                  No results for &ldquo;{q}&rdquo;.
                </div>
              )}
              {filteredIndustryWeekly.map((item, i) => (
                <a
                  key={i}
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-3 group"
                >
                  <VisualTile icon="factory" tone={item.tone} image={item.image} className="aspect-video rounded">
                    <div
                      className={`absolute top-2 left-2 px-2 py-1 font-mono text-[10px] font-bold ${TONE_BG[item.tone]} text-accent-on`}
                    >
                      {item.tag}
                    </div>
                    <div className={`absolute top-2 right-2 px-2 py-1 font-mono text-[10px] rounded uppercase ${TONE_CHIP[REGION_TONE[item.region]]}`}>
                      {item.region}
                    </div>
                  </VisualTile>
                  <div>
                    <h4 className="text-[16px] font-semibold leading-tight mb-2 text-ink group-hover:text-accent transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-ink-muted text-[13px] line-clamp-2">{item.desc}</p>
                    <SourceBadge source={item.source} className="font-mono text-[10px] text-ink-faint mt-1" />
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="glass-card rounded flex flex-col">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-panel-high/20">
              <div className="flex items-center gap-2">
                <Icon name="groups" size={20} className="text-accent" />
                <h2 className="text-headline-sm text-ink">Executive Moves</h2>
              </div>
              <span className="font-mono text-[10px] text-ink-faint uppercase">Competitor Leadership</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {leadershipMoves.map((appointment, i) => (
                <LeadershipCard key={i} appointment={appointment} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section id="market-data" className="glass-card rounded p-6 scroll-mt-20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-headline-sm text-ink">Market Data</h2>
              <span className="font-mono text-[11px] text-ink-faint">LIVE SYNC</span>
            </div>
            <div className="space-y-4">
              {marketSeries.map((series) => (
                <div key={series.label} className="flex items-center justify-between p-3 bg-ink/5 rounded">
                  <div>
                    <p className="font-mono text-[10px] text-ink-faint uppercase">{series.label}</p>
                    <p className="text-[20px] font-bold text-ink">
                      {series.value}{" "}
                      <span
                        className={`text-[12px] font-normal ${
                          series.direction === "up" ? "text-accent" : "text-danger"
                        }`}
                      >
                        {series.change}
                      </span>
                    </p>
                  </div>
                  <div className="w-24 h-10 flex items-end gap-0.5">
                    {series.bars.map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 ${series.direction === "up" ? "bg-accent" : "bg-danger"}`}
                        style={{ height: `${h}%`, opacity: 0.3 + (i / series.bars.length) * 0.7 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-headline-sm text-ink">Project Highlights</h2>
              <Link href="/project-tracker" className="font-mono text-[11px] text-accent">
                VIEW ALL 142 →
              </Link>
            </div>
            <div className="space-y-6">
              {projectHighlights.map((project) => (
                <div key={project.title}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-bold text-ink">{project.title}</p>
                      <p className="font-mono text-[11px] text-ink-muted">{project.location}</p>
                    </div>
                    <span className={`font-mono ${TONE_TEXT[project.tone]}`}>{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${TONE_BG[project.tone]}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-headline-sm text-ink">Opportunity Radar</h2>
              <Icon name="radar" size={20} className="text-accent" />
            </div>
            <div className="space-y-3">
              {opportunityRadar.map((entry) => (
                <div
                  key={entry.code}
                  className="flex items-center gap-4 p-2 border-b border-border last:border-0"
                >
                  <CountryBadge country={entry.country} className="w-8 h-8 rounded bg-panel-high border border-border text-[10px] text-ink" />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-ink">{entry.country}</p>
                    <p className="text-[11px] text-ink-muted">{entry.sector}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] rounded uppercase ${
                        entry.tier === "High" ? TONE_CHIP.accent : TONE_CHIP.warning
                      }`}
                    >
                      {entry.tier}
                    </span>
                    <p className="text-[10px] text-ink-faint mt-0.5">{entry.potential}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
