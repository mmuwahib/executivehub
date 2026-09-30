import Link from "next/link";
import { Icon } from "@/lib/icons";
import { TONE_TEXT, TONE_BG, TONE_CHIP } from "@/lib/tone";
import { getGeopoliticalData } from "@/lib/api";
import PrintButton from "@/components/print-button";
import ZuluClock from "@/components/zulu-clock";
import SourceBadge from "@/components/source-badge";
import RiskMap from "@/components/risk-map";
import { IntelArticle } from "@/lib/types";
import { safeUrl } from "@/lib/safe-url";

const TAGS: IntelArticle["tag"][] = ["WARNING", "MONITOR"];

export default async function GeopoliticalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const { hotZone, riskRegions, criticalIncident, countryRisk, articles } = await getGeopoliticalData();

  const filteredArticles = articles.filter((article) => {
    if (tag && article.tag !== tag) return false;
    if (q) {
      const needle = q.toLowerCase();
      return (
        article.title.toLowerCase().includes(needle) ||
        article.desc.toLowerCase().includes(needle) ||
        article.region.toLowerCase().includes(needle)
      );
    }
    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-lg text-ink tracking-tight">Geopolitical Intelligence</h1>
          <p className="text-ink-muted mt-1">
            Sources: <span className="text-accent font-semibold">Khaleej Times</span>,{" "}
            <span className="text-accent font-semibold">Al Jazeera</span> and{" "}
            <span className="text-accent font-semibold">Arab News</span>, matched to each story&apos;s country.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-panel-high rounded-lg border border-border">
            <Link
              href="/geopolitical"
              className={`px-3 py-1.5 text-[11px] font-mono rounded-md transition-colors ${
                !tag ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
              }`}
            >
              ALL
            </Link>
            {TAGS.map((t) => (
              <Link
                key={t}
                href={`/geopolitical?tag=${t}`}
                className={`px-3 py-1.5 text-[11px] font-mono rounded-md transition-colors ${
                  tag === t ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
          <PrintButton label="EXPORT" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Map Panel */}
        <div className="col-span-12 xl:col-span-9 glass-card rounded overflow-hidden relative min-h-[480px]">
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-surface/80 to-transparent">
            <span className="flex items-center gap-2 bg-danger/10 px-3 py-1 rounded text-danger font-mono text-label-caps border border-danger/20">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse-glow" /> LIVE GLOBAL RISK OVERLAY
            </span>
            <ZuluClock className="font-mono text-ticker-data text-ink-faint" />
          </div>
          <RiskMap countryRisk={countryRisk} hotZone={hotZone} criticalIncident={criticalIncident} />
        </div>

        {/* Right Panel */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          <div className="bg-danger/5 border border-danger/30 p-card rounded relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Icon name="warning" size={64} />
            </div>
            <div className="flex items-center gap-2 text-danger mb-2">
              <span className="font-mono text-label-caps font-bold">CRITICAL INCIDENT</span>
            </div>
            <h3 className="text-headline-sm text-ink mb-2">{criticalIncident.title}</h3>
            <p className="text-sm text-ink-muted mb-4">{criticalIncident.desc}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="font-mono text-ticker-data text-danger">{criticalIncident.time}</span>
              <a
                href={safeUrl(criticalIncident.sourceUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-mono text-label-caps underline underline-offset-4 decoration-accent/30"
              >
                VIEW
              </a>
            </div>
          </div>

          <div className="glass-card p-card rounded">
            <div className="font-mono text-label-caps text-ink-faint mb-6">RISK BY REGION</div>
            <div className="space-y-6">
              {riskRegions.map((region) => (
                <div key={region.name}>
                  <div className="flex justify-between font-mono text-[11px] mb-2">
                    <span className="text-ink">{region.name}</span>
                    <span className={`font-bold ${TONE_TEXT[region.tone]}`}>{region.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-panel-highest rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${TONE_BG[region.tone]}`} style={{ width: `${region.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Feed */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="rss_feed" size={22} className="text-accent" />
          <h2 className="text-headline-md text-ink">Live Intelligence Feed</h2>
          <span className="text-ink-faint font-mono text-ticker-data opacity-60">{filteredArticles.length} articles</span>
        </div>
        <ZuluClock className="font-mono text-ticker-data text-ink-faint" />
      </div>
      <div className="space-y-4">
        {filteredArticles.length === 0 && (
          <div className="glass-card rounded p-8 text-center text-ink-muted text-sm">
            No results{q ? ` for "${q}"` : ""}.
          </div>
        )}
        {filteredArticles.map((article, i) => (
          <a
            key={i}
            href={safeUrl(article.sourceUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card group hover:bg-ink/5 transition-all rounded overflow-hidden flex items-stretch"
          >
            <div className={`w-1 opacity-0 group-hover:opacity-100 transition-opacity ${TONE_BG[article.tag === "WARNING" ? "danger" : "accent"]}`} />
            <div className="flex-1 p-6 grid grid-cols-12 items-center gap-8">
              <div className="col-span-12 md:col-span-2">
                <span
                  className={`block px-2 py-1 text-center font-mono text-[10px] rounded w-20 mb-2 ${
                    article.tag === "WARNING" ? TONE_CHIP.warning : TONE_CHIP.accent
                  }`}
                >
                  {article.tag}
                </span>
                <div className="text-[10px] text-ink-faint font-mono uppercase">REGION: {article.region}</div>
                <div className="font-mono text-ticker-data text-ink-muted mt-1">{article.time}</div>
              </div>
              <div className="col-span-12 md:col-span-9">
                <h3 className="text-headline-sm text-ink mb-1 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">{article.desc}</p>
                <div className="flex items-center gap-2 mt-2">
                  <SourceBadge source={article.source} className="font-mono text-[10px] text-ink-muted" />
                </div>
              </div>
              <div className="col-span-12 md:col-span-1 flex justify-end">
                <Icon name="chevron_right" className="text-ink-faint group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
