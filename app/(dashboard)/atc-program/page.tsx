import { Icon } from "@/lib/icons";
import { atcData } from "@/lib/atc-data";

export default function AtcProgramPage() {
  const { overview, stats, focusAreas, milestones, quotes, ccusPortfolio, outlook, sources } = atcData;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Hero */}
      <div className="glass-card rounded-xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 map-mesh opacity-20" />
        <div className="relative">
          <div className="flex items-center gap-2 text-accent mb-3">
            <Icon name="science" size={22} />
            <span className="font-mono text-label-caps uppercase">Gulf Cryo × Saudi Aramco</span>
          </div>
          <h1 className="text-display-lg text-ink tracking-tight mb-2">{overview.title}</h1>
          <p className="text-accent/80 font-mono text-sm mb-4">{overview.subtitle}</p>
          <p className="text-ink-muted max-w-3xl leading-relaxed">{overview.description}</p>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded p-card">
            <div className="flex items-center gap-2 mb-3">
              <Icon name={stat.icon} size={20} className="text-accent" />
              <span className="font-mono text-[11px] text-ink-faint uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-[28px] font-bold text-ink leading-tight mb-1">{stat.value}</div>
            <p className="text-ink-muted text-[13px]">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* Focus Areas */}
      <section className="mb-10">
        <h2 className="text-headline-md text-ink mb-6 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-accent rounded-full" />
          Focus Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {focusAreas.map((area) => (
            <div key={area.title} className="glass-card rounded p-6">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Icon name={area.icon} size={24} className="text-accent" />
              </div>
              <h3 className="text-headline-sm text-ink mb-2">{area.title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{area.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="mb-10">
        <h2 className="text-headline-md text-ink mb-6 flex items-center gap-3">
          <Icon name="calendar" size={22} className="text-accent" />
          Milestones
        </h2>
        <div className="glass-card rounded-xl divide-y divide-border">
          {milestones.map((milestone, i) => (
            <div key={i} className="p-6 flex gap-6">
              <div className="shrink-0 w-28 font-mono text-[12px] text-accent uppercase pt-0.5">{milestone.date}</div>
              <div className="flex-1">
                <h3 className="text-headline-sm text-ink mb-1">{milestone.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed mb-2">{milestone.desc}</p>
                <a
                  href={milestone.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-ink-faint hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  <Icon name="external_link" size={12} /> {milestone.source}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quotes */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotes.map((q) => (
            <div key={q.name} className="glass-card rounded p-6 relative">
              <Icon name="quote" size={28} className="text-accent/30 mb-3" />
              <p className="text-ink italic leading-relaxed mb-4">&ldquo;{q.quote}&rdquo;</p>
              <p className="text-sm font-bold text-ink">{q.name}</p>
              <p className="font-mono text-[11px] text-ink-faint">{q.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CCUS Portfolio */}
      <section className="mb-10">
        <h2 className="text-headline-md text-ink mb-6 flex items-center gap-3">
          <Icon name="handshake" size={22} className="text-accent" />
          Gulf Cryo's Broader CCUS Portfolio
        </h2>
        <div className="glass-card rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-panel-high/40 rounded">
              <div className="text-[28px] font-bold text-accent">{ccusPortfolio.investment}</div>
              <p className="text-ink-muted text-[13px]">{ccusPortfolio.investmentDesc}</p>
            </div>
            <div className="p-4 bg-panel-high/40 rounded">
              <div className="text-[28px] font-bold text-accent">{ccusPortfolio.target}</div>
              <p className="text-ink-muted text-[13px]">{ccusPortfolio.targetDesc}</p>
            </div>
          </div>
          <p className="text-ink-muted text-sm leading-relaxed mb-6 border-l-2 border-accent/30 pl-4">
            {ccusPortfolio.firstFacility}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="business" size={16} className="text-ink-faint" />
            <span className="font-mono text-[11px] text-ink-faint uppercase">Named Partnerships</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ccusPortfolio.partnerships.map((p) => (
              <div key={p.name} className="p-3 border border-border rounded">
                <p className="text-sm font-bold text-ink">{p.name}</p>
                <p className="text-ink-muted text-[12px]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outlook */}
      <section className="mb-10">
        <h2 className="text-headline-md text-ink mb-6 flex items-center gap-3">
          <Icon name="target" size={22} className="text-accent" />
          What's Next
        </h2>
        <div className="glass-card rounded-xl p-6 border-l-4 border-l-accent">
          <p className="text-ink leading-relaxed">{outlook}</p>
        </div>
      </section>

      {/* Sources */}
      <section className="mb-4">
        <h2 className="text-headline-sm text-ink-faint mb-4 font-mono uppercase tracking-wider">Sources</h2>
        <div className="space-y-2">
          {sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-accent transition-colors"
            >
              <Icon name="external_link" size={14} />
              {source.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
