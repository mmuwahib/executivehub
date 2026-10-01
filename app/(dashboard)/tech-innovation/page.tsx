import { getTechArticles } from "@/lib/api";
import { safeUrl } from "@/lib/safe-url";
import { Region, TechArticle } from "@/lib/types";
import PrintButton from "@/components/print-button";
import PageHeader from "@/components/page-header";
import FilterChips from "@/components/filter-chips";

const TAGS = ["Hydrogen", "Renewable", "CCS/CCU", "Innovation"];
const REGIONS: Region[] = ["MENA", "Europe", "ASEAN", "Americas"];

// One colour per topic, used for the tag label and the topic mix bar.
const TAG_TEXT: Record<string, string> = {
  Hydrogen: "text-cyan",
  Renewable: "text-positive",
  "CCS/CCU": "text-warning",
  Innovation: "text-accent",
};
const TAG_BAR: Record<string, string> = {
  Hydrogen: "bg-cyan",
  Renewable: "bg-positive",
  "CCS/CCU": "bg-warning",
  Innovation: "bg-accent",
};

function Meta({ article }: { article: TechArticle }) {
  return (
    <span className="eyebrow flex flex-wrap gap-x-2">
      <span className={`font-semibold ${TAG_TEXT[article.tag] ?? "text-ink-muted"}`}>{article.tag}</span>
      <span>
        · {article.region} · {article.time}
      </span>
    </span>
  );
}

export default async function TechInnovationPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; region?: string }>;
}) {
  const { q, tag, region } = await searchParams;
  const allArticles = await getTechArticles();

  const needle = q?.toLowerCase();
  const articles = allArticles.filter((article) => {
    if (tag && article.tag !== tag) return false;
    if (region && article.region !== region) return false;
    if (needle) {
      return (
        article.title.toLowerCase().includes(needle) ||
        article.desc.toLowerCase().includes(needle) ||
        article.tag.toLowerCase().includes(needle)
      );
    }
    return true;
  });

  function withParam(key: "tag" | "region", value?: string) {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (region) params.set("region", region);
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    return query ? `/tech-innovation?${query}` : "/tech-innovation";
  }

  const featured = articles.find((a) => a.size === "featured") ?? articles[0];
  const rest = articles.filter((a) => a !== featured);
  const side = rest.slice(0, 2);
  const grid = rest.slice(2);

  const topicCounts = TAGS.map((t) => ({ tag: t, count: allArticles.filter((a) => a.tag === t).length })).filter((t) => t.count > 0);
  const topicTotal = topicCounts.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Weekly · updated Sunday"
        title="Tech & innovation"
        description="Hydrogen, renewables, CCS/CCU and industrial gas technology worldwide"
        actions={<PrintButton label="Export PDF" />}
      />

      <div className="glass-card rounded-xl px-4 py-3 flex flex-wrap justify-between gap-4">
        <FilterChips
          label="Topic"
          chips={[
            { label: "All", href: withParam("tag"), active: !tag },
            ...TAGS.map((t) => ({ label: t, href: withParam("tag", t), active: tag === t })),
          ]}
        />
        <FilterChips
          label="Region"
          chips={[
            { label: "All", href: withParam("region"), active: !region },
            ...REGIONS.map((r) => ({ label: r, href: withParam("region", r), active: region === r })),
          ]}
        />
      </div>

      {articles.length === 0 && (
        <p className="glass-card rounded-xl p-8 text-center text-sm text-ink-muted">
          {allArticles.length === 0
            ? "No tech articles from the last 21 days passed the source checks this week."
            : `No articles match${q ? ` "${q}"` : " these filters"}.`}
        </p>
      )}

      {featured && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <a
            href={safeUrl(featured.sourceUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className={`glass-card rounded-xl p-7 flex flex-col gap-3.5 group border-accent/40 ${side.length ? "lg:col-span-7" : "lg:col-span-12"}`}
          >
            <Meta article={featured} />
            <span className="text-[26px] font-bold leading-tight tracking-tight text-ink group-hover:text-accent">{featured.title}</span>
            <span className="text-[15px] text-ink-muted">{featured.desc}</span>
            <span className="mt-auto text-[13px] font-semibold text-accent">{featured.source} · Read article →</span>
          </a>
          {side.length > 0 && (
            <div className="lg:col-span-5 flex flex-col gap-5">
              {side.map((article) => (
                <a
                  key={article.title}
                  href={safeUrl(article.sourceUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl p-5 flex flex-col gap-2 flex-1 group"
                >
                  <Meta article={article} />
                  <span className="text-[17px] font-bold leading-snug text-ink group-hover:text-accent">{article.title}</span>
                  <span className="mt-auto text-[13px] text-ink-faint">{article.source}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {grid.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {grid.map((article) => (
            <a
              key={article.title}
              href={safeUrl(article.sourceUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-5 flex flex-col gap-2 group"
            >
              <Meta article={article} />
              <span className="text-base font-bold leading-snug text-ink group-hover:text-accent">{article.title}</span>
              <span className="text-[13px] text-ink-muted line-clamp-3">{article.desc}</span>
              <span className="mt-auto text-[12px] text-ink-faint">{article.source}</span>
            </a>
          ))}
        </div>
      )}

      {topicTotal > 0 && (
        <div className="glass-card rounded-xl p-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="eyebrow">Topic mix</span>
          <div className="flex-1 min-w-[200px] flex h-3 rounded-full overflow-hidden" aria-hidden="true">
            {topicCounts.map((t) => (
              <span key={t.tag} className={TAG_BAR[t.tag]} style={{ width: `${(t.count / topicTotal) * 100}%` }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-[12px] text-ink-muted">
            {topicCounts.map((t) => (
              <span key={t.tag}>
                {t.tag} {t.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
