import { atcData } from "@/lib/atc-data";
import Panel from "@/components/panel";

const FOCUS_ACCENT = ["text-positive", "text-warning"];

export default function AtcProgramPage() {
  const { overview, stats, focusAreas, milestones, quotes, ccusPortfolio, outlook, sources } = atcData;

  return (
    <div className="flex flex-col gap-7">
      <section className="rounded-xl border border-accent/40 bg-panel-high p-7 md:p-9 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        <div className="lg:col-span-3 flex flex-col gap-3">
          <span className="eyebrow text-accent">{overview.subtitle}</span>
          <h1 className="m-0 text-[34px] font-extrabold leading-tight tracking-tight text-ink">{overview.title}</h1>
          <p className="m-0 text-base text-ink-muted max-w-[62ch]">{overview.description}</p>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-surface p-4 flex flex-col gap-1">
              <span className="text-[22px] font-extrabold leading-tight text-ink">{stat.value}</span>
              <span className="text-[12px] text-ink-muted">{stat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {focusAreas.map((area, i) => (
              <article key={area.title} className="glass-card rounded-xl p-6 flex flex-col gap-2">
                <span className={`eyebrow font-semibold ${FOCUS_ACCENT[i] ?? "text-accent"}`}>Focus area</span>
                <span className="text-lg font-bold text-ink">{area.title}</span>
                <span className="text-sm text-ink-muted">{area.desc}</span>
              </article>
            ))}
          </section>

          <Panel title="Milestones">
            <ol className="m-0 p-0 list-none flex flex-col">
              {milestones.map((milestone, i) => {
                const last = i === milestones.length - 1;
                return (
                  <li key={milestone.title} className="grid grid-cols-[110px_18px_minmax(0,1fr)] gap-x-3.5">
                    <span className="font-mono text-[12px] text-accent uppercase pt-0.5">{milestone.date}</span>
                    <span className="flex flex-col items-center" aria-hidden="true">
                      <span className={`w-3 h-3 rounded-full mt-1 ${last ? "bg-positive" : "bg-accent"}`} />
                      {!last && <span className="flex-1 w-0.5 bg-border-strong" />}
                    </span>
                    <div className={`flex flex-col gap-1 ${last ? "" : "pb-6"}`}>
                      <span className="font-bold text-ink">{milestone.title}</span>
                      <span className="text-sm text-ink-muted">{milestone.desc}</span>
                      <a href={milestone.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold">
                        {milestone.source} →
                      </a>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {quotes.map((q) => (
              <figure key={q.name} className="m-0 glass-card rounded-xl p-6 flex flex-col gap-4">
                <blockquote className="m-0 text-base leading-relaxed text-ink">&ldquo;{q.quote}&rdquo;</blockquote>
                <figcaption className="mt-auto flex flex-col">
                  <span className="font-bold text-ink">{q.name}</span>
                  <span className="text-[13px] text-ink-muted">{q.role}</span>
                </figcaption>
              </figure>
            ))}
          </section>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <Panel title="CCUS portfolio">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-panel-high p-4 flex flex-col gap-1">
                <span className="text-[28px] font-extrabold leading-none text-ink">{ccusPortfolio.investment}</span>
                <span className="text-[12px] text-ink-muted">{ccusPortfolio.investmentDesc}</span>
              </div>
              <div className="rounded-xl bg-panel-high p-4 flex flex-col gap-1">
                <span className="text-[20px] font-extrabold leading-tight text-ink">{ccusPortfolio.target}</span>
                <span className="text-[12px] text-ink-muted">{ccusPortfolio.targetDesc}</span>
              </div>
            </div>
            <p className="m-0 text-sm text-ink-muted">{ccusPortfolio.firstFacility}</p>
            <div className="flex flex-col">
              <span className="eyebrow pb-2">Partnerships</span>
              {ccusPortfolio.partnerships.map((p) => (
                <div key={p.name} className="flex justify-between gap-3 py-3 border-t border-border">
                  <span className="font-semibold text-ink">{p.name}</span>
                  <span className="text-[13px] text-ink-muted text-right">{p.desc}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Outlook">
            <p className="m-0 text-sm text-ink-muted leading-relaxed">{outlook}</p>
          </Panel>

          <Panel>
            <span className="eyebrow">Sources</span>
            <div className="flex flex-col gap-2.5 -mt-2">
              {sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm">
                  {source.title}
                </a>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
