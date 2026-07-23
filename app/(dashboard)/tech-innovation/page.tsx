import Link from "next/link";
import { Icon } from "@/lib/icons";
import { TONE_CHIP, REGION_TONE } from "@/lib/tone";
import { getTechArticles } from "@/lib/api";
import PrintButton from "@/components/print-button";
import VisualTile from "@/components/visual-tile";
import SourceBadge from "@/components/source-badge";
import { TechArticle, Region } from "@/lib/types";

const SIZE_SPAN: Record<TechArticle["size"], string> = {
  featured: "col-span-12 md:col-span-8",
  wide: "col-span-12 md:col-span-8",
  standard: "col-span-12 md:col-span-4",
  half: "col-span-12 md:col-span-6",
};

const TAGS = ["Hydrogen", "Renewable", "CCS/CCU", "Innovation"];
const REGIONS: Region[] = ["MENA", "Europe", "ASEAN", "Americas"];

export default async function TechInnovationPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; region?: string }>;
}) {
  const { q, tag, region } = await searchParams;
  const allArticles = await getTechArticles();

  const needle = q?.toLowerCase();
  const techArticles = allArticles.filter((article) => {
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

  function withParam(key: string, value?: string) {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (region) params.set("region", region);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    return query ? `/tech-innovation?${query}` : "/tech-innovation";
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4 mb-6">
        <div className="space-y-2">
          <h1 className="text-display-lg text-ink">Technological Innovation</h1>
          <div className="flex items-center gap-4 text-ink-muted flex-wrap">
            <span>H2 View • Renewables Now • Gasworld</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-accent/70">Hydrogen, Renewables & Industrial Gas Technology</span>
            <span className="font-mono text-[11px] text-ink-faint">({techArticles.length} articles)</span>
          </div>
        </div>
        <PrintButton
          label="EXPORT"
          icon="download"
          className="px-5 py-2 glass-card hover:bg-accent/10 flex items-center gap-2 text-ink font-mono text-[12px] tracking-wider rounded"
        />
      </div>

      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-1 p-1 bg-panel-high rounded-lg border border-border w-fit flex-wrap">
          <span className="px-2 font-mono text-[10px] text-ink-faint uppercase">Topic:</span>
          <Link
            href={withParam("tag")}
            className={`px-3 py-1.5 text-[11px] font-mono rounded-md ${
              !tag ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
            }`}
          >
            ALL
          </Link>
          {TAGS.map((t) => (
            <Link
              key={t}
              href={withParam("tag", t)}
              className={`px-3 py-1.5 text-[11px] font-mono rounded-md whitespace-nowrap ${
                tag === t ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 bg-panel-high rounded-lg border border-border w-fit flex-wrap">
          <span className="px-2 font-mono text-[10px] text-ink-faint uppercase">Region:</span>
          <Link
            href={withParam("region")}
            className={`px-3 py-1.5 text-[11px] font-mono rounded-md ${
              !region ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
            }`}
          >
            ALL
          </Link>
          {REGIONS.map((r) => (
            <Link
              key={r}
              href={withParam("region", r)}
              className={`px-3 py-1.5 text-[11px] font-mono rounded-md whitespace-nowrap ${
                region === r ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
      </div>

      {techArticles.length === 0 && (
        <div className="glass-card rounded p-8 text-center text-ink-muted text-sm">
          No results{q ? ` for "${q}"` : ""}.
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {techArticles.map((article) => (
          <article key={article.title} className={SIZE_SPAN[article.size]}>
            <div className="glass-card p-card h-full flex flex-col rounded">
              {article.size === "wide" ? (
                <div className="flex gap-6 h-full">
                  <div className="flex-1 flex flex-col">
                    <ArticleHeader article={article} />
                    <h2 className="text-headline-md text-ink mb-4">{article.title}</h2>
                    <p className="text-ink-muted text-sm mb-6">{article.desc}</p>
                    <ArticleFooter article={article} />
                  </div>
                  <VisualTile
                    icon={article.icon ?? "bolt"}
                    tone={article.tone}
                    image={article.image}
                    className="w-48 hidden lg:block rounded border border-border"
                  />
                </div>
              ) : (
                <>
                  <ArticleHeader article={article} />
                  <h2 className={article.size === "featured" ? "text-headline-md text-ink mb-4" : "text-headline-sm text-ink mb-4"}>
                    {article.title}
                  </h2>
                  <p className={`text-ink-muted text-sm ${article.size === "featured" ? "mb-8 flex-1 max-w-2xl" : "mb-6"}`}>
                    {article.desc}
                  </p>
                  <ArticleFooter article={article} />
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ArticleHeader({ article }: { article: TechArticle }) {
  return (
    <div className="flex justify-between items-start mb-6 gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-3 py-1 font-mono text-[10px] tracking-widest uppercase rounded ${TONE_CHIP[article.tone]}`}>
          {article.tag}
        </span>
        <span className={`px-2 py-1 font-mono text-[10px] tracking-widest uppercase rounded ${TONE_CHIP[REGION_TONE[article.region]]}`}>
          {article.region}
        </span>
      </div>
      <span className="font-mono text-[11px] text-ink-faint opacity-60 shrink-0">{article.time}</span>
    </div>
  );
}

function ArticleFooter({ article }: { article: TechArticle }) {
  return (
    <div className="mt-auto flex items-center gap-2 text-ink-muted text-[11px] font-mono">
      <a
        href={article.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
      >
        <SourceBadge source={article.source} />
      </a>
    </div>
  );
}
