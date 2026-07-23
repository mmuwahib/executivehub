import Link from "next/link";
import { Icon } from "@/lib/icons";
import { TONE_TEXT, TONE_BG, TONE_CHIP, TONE_BORDER_TOP } from "@/lib/tone";
import { getProjectTrackerData } from "@/lib/api";
import VisualTile from "@/components/visual-tile";
import CountryBadge from "@/components/country-badge";
import { Direction, ProjectCategory } from "@/lib/types";

const TREND_ICON: Record<Direction, string> = {
  up: "trending_up",
  down: "trending_down",
  flat: "trending_flat",
};

const TREND_TONE: Record<Direction, "accent" | "danger" | "neutral"> = {
  up: "accent",
  down: "danger",
  flat: "neutral",
};

const OPPORTUNITY_CHIP: Record<string, string> = {
  HIGH: TONE_CHIP.accent,
  MEDIUM: TONE_CHIP.neutral,
  EMERGING: TONE_CHIP.danger,
};

const CATEGORY_TABS: { label: string; value: ProjectCategory }[] = [
  { label: "NEW CONSTRUCTION", value: "construction" },
  { label: "RENEWABLE", value: "renewable" },
  { label: "SUSTAINABILITY", value: "sustainability" },
];

// "UAE" (used in the sidebar's country list) doesn't literally appear inside
// the territories table's "United Arab Emirates" — resolve the couple of
// known aliases so that filter link actually matches.
const COUNTRY_ALIASES: Record<string, string> = { UAE: "United Arab Emirates" };

function matchesCountry(value: string, filter: string): boolean {
  const v = value.toLowerCase();
  const f = filter.toLowerCase();
  const alias = (COUNTRY_ALIASES[filter] ?? filter).toLowerCase();
  return v.includes(f) || v.includes(alias) || f.includes(v);
}

export default async function ProjectTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; country?: string }>;
}) {
  const { q, category, country } = await searchParams;
  const { kpis, projects, territories } = await getProjectTrackerData();

  const needle = q?.toLowerCase();

  const filteredProjects = projects.filter((project) => {
    if (category && project.category !== category) return false;
    if (country && !matchesCountry(project.location, country)) return false;
    if (needle) {
      return (
        project.title.toLowerCase().includes(needle) || project.location.toLowerCase().includes(needle)
      );
    }
    return true;
  });

  const filteredTerritories = territories.filter((row) => {
    if (country && !matchesCountry(row.country, country)) return false;
    if (needle) {
      return row.country.toLowerCase().includes(needle) || row.sector.toLowerCase().includes(needle);
    }
    return true;
  });

  const activeFilterLabel = country ? `country: ${country}` : q ? `"${q}"` : null;

  return (
    <div className="max-w-[1600px] mx-auto">
      <section className="mb-10">
        <div className="flex items-center gap-2 text-accent mb-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-label-caps">LIVE REGIONAL UPDATES</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-display-lg text-ink mb-2 tracking-tight">Regional Project Tracking</h1>
            <p className="text-ink-faint max-w-2xl">
              Monitoring industrial projects across all 10 territories — tracked for industrial gas demand and ATC/Aramco relevance.
            </p>
            {country && (
              <Link
                href="/project-tracker"
                className="inline-flex items-center gap-1 mt-2 text-[11px] font-mono text-accent hover:underline"
              >
                <Icon name="location_on" size={12} /> Filtered by {country} — clear
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 p-1 bg-panel-high rounded-lg border border-border overflow-x-auto">
            <Link
              href={country ? `/project-tracker?country=${encodeURIComponent(country)}` : "/project-tracker"}
              className={`px-4 py-2 text-[11px] font-mono rounded-md whitespace-nowrap transition-colors ${
                !category ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
              }`}
            >
              ALL TERRITORIES
            </Link>
            {CATEGORY_TABS.map((tab) => {
              const params = new URLSearchParams();
              params.set("category", tab.value);
              if (country) params.set("country", country);
              return (
                <Link
                  key={tab.value}
                  href={`/project-tracker?${params.toString()}`}
                  className={`px-4 py-2 text-[11px] font-mono rounded-md whitespace-nowrap transition-colors ${
                    category === tab.value ? "bg-accent text-accent-on" : "text-ink-faint hover:text-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* KPI Row */}
      <section className="grid grid-cols-12 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`col-span-12 md:col-span-6 lg:col-span-3 glass-card p-card rounded-xl relative overflow-hidden border-t-2 ${TONE_BORDER_TOP[kpi.tone]}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-label-caps text-ink-faint">{kpi.label}</span>
              <Icon name={kpi.icon} size={20} className={TONE_TEXT[kpi.tone]} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-display-lg ${TONE_TEXT[kpi.tone] === "text-ink-muted" ? "text-ink" : TONE_TEXT[kpi.tone]}`}>
                {kpi.value}
              </span>
              {kpi.suffix && <span className="text-ink-faint font-mono">{kpi.suffix}</span>}
            </div>
            <div className={`font-mono text-ticker-data uppercase ${TONE_TEXT[kpi.tone]}`}>{kpi.delta}</div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Icon name={kpi.icon} size={120} />
            </div>
          </div>
        ))}
      </section>

      {/* Project Cards */}
      <section className="grid grid-cols-12 gap-4 mb-12">
        {filteredProjects.length === 0 && (
          <div className="col-span-12 glass-card rounded-xl p-8 text-center text-ink-muted text-sm">
            No projects match {activeFilterLabel ?? "the current filter"}.
          </div>
        )}
        {filteredProjects.map((project) => (
          <div key={project.title} className="col-span-12 lg:col-span-6 glass-card rounded-xl overflow-hidden group">
            <VisualTile icon={project.icon} tone={project.statusTone} image={project.image}>
              {project.atcConnection && (
                <div className="absolute top-4 right-4 bg-accent/20 backdrop-blur-md border border-accent/40 px-3 py-1 rounded text-[10px] font-mono text-accent flex items-center gap-2">
                  <Icon name="link" size={14} /> ATC CONNECTION
                </div>
              )}
            </VisualTile>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-headline-md text-ink">{project.title}</h3>
                  <div className="flex items-center gap-2 text-ink-faint mt-1 font-mono text-[12px]">
                    <CountryBadge country={project.location} className="w-5 h-5 rounded bg-panel-high border border-border text-[8px] text-ink-faint" /> {project.location}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded font-mono text-[10px] ${TONE_CHIP[project.statusTone]}`}>
                  {project.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-panel-high/50 p-3 border border-border rounded">
                  <div className="text-ink-faint text-[10px] font-mono mb-1">GAS DEMAND</div>
                  <div className="text-ink text-headline-sm">{project.gasDemand}</div>
                </div>
                <div className="bg-panel-high/50 p-3 border border-border rounded">
                  <div className="text-ink-faint text-[10px] font-mono mb-1">INNOVATION</div>
                  <div className="text-accent text-headline-sm">{project.innovation}</div>
                </div>
              </div>
              <p className="text-ink-faint italic text-[12px] border-l-2 border-border pl-4">&ldquo;{project.quote}&rdquo;</p>
            </div>
          </div>
        ))}
      </section>

      {/* Territory Table */}
      <section className="glass-card rounded-xl overflow-hidden mb-12">
        <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-headline-sm text-ink">Territory Activity Heatmap — 10 Countries</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger" />
              <span className="font-mono text-[10px] text-ink-faint">HIGH</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span className="font-mono text-[10px] text-ink-faint">MEDIUM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ink-faint" />
              <span className="font-mono text-[10px] text-ink-faint">EMERGING</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="text-ink-faint border-b border-border">
                <th className="p-6 font-mono text-label-caps">COUNTRY</th>
                <th className="p-6 font-mono text-label-caps">PROJECTS</th>
                <th className="p-6 font-mono text-label-caps">INNOVATION</th>
                <th className="p-6 font-mono text-label-caps">KEY SECTOR</th>
                <th className="p-6 font-mono text-label-caps">GC OPPORTUNITY</th>
                <th className="p-6 font-mono text-label-caps text-right">TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTerritories.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-muted text-sm">
                    No territory data for {country ?? q}.
                  </td>
                </tr>
              )}
              {filteredTerritories.map((row) => (
                <tr key={row.country} className="hover:bg-accent/5 transition-colors">
                  <td className="p-6 text-ink font-semibold">
                    <span className="inline-flex items-center gap-2">
                      <CountryBadge country={row.country} className="w-6 h-6 rounded bg-panel-high border border-border text-[9px] text-ink" /> {row.country}
                    </span>
                  </td>
                  <td className="p-6 text-ink-muted">{row.projects}</td>
                  <td className="p-6">
                    <div className="w-24 h-1 bg-panel-highest rounded-full overflow-hidden">
                      <div className="bg-accent h-full" style={{ width: `${row.innovationPct}%` }} />
                    </div>
                  </td>
                  <td className="p-6 text-ink-faint">{row.sector}</td>
                  <td className="p-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${OPPORTUNITY_CHIP[row.opportunity]}`}>
                      {row.opportunity}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <Icon name={TREND_ICON[row.trend]} className={TONE_TEXT[TREND_TONE[row.trend]]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
