import Link from "next/link";
import { getProjectTrackerData } from "@/lib/api";
import { COUNTRIES } from "@/lib/nav";
import { Direction, ProjectCategory, Tone } from "@/lib/types";
import PageHeader from "@/components/page-header";
import FilterChips from "@/components/filter-chips";
import KpiBand from "@/components/kpi-band";
import Panel from "@/components/panel";

const STATUS_CHIP: Record<Tone, string> = {
  accent: "bg-accent/20 text-accent",
  cyan: "bg-cyan/15 text-cyan",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  neutral: "bg-panel-highest text-ink-muted",
};

const OPPORTUNITY_TEXT: Record<string, string> = {
  HIGH: "text-accent",
  MEDIUM: "text-warning",
  EMERGING: "text-cyan",
};

const TREND: Record<Direction, { symbol: string; className: string; label: string }> = {
  up: { symbol: "▲", className: "text-positive", label: "rising" },
  down: { symbol: "▼", className: "text-danger", label: "falling" },
  flat: { symbol: "—", className: "text-ink-faint", label: "flat" },
};

const CATEGORY_TABS: { label: string; value: ProjectCategory }[] = [
  { label: "Construction", value: "construction" },
  { label: "Renewable", value: "renewable" },
  { label: "Sustainability", value: "sustainability" },
];

// "UAE" (used in the country filter) doesn't literally appear inside the
// territories table's "United Arab Emirates", so resolve known aliases.
const COUNTRY_ALIASES: Record<string, string> = { UAE: "United Arab Emirates" };

function matchesCountry(value: string, filter: string): boolean {
  const v = value.toLowerCase();
  const f = filter.toLowerCase();
  const alias = (COUNTRY_ALIASES[filter] ?? filter).toLowerCase();
  return v.includes(f) || v.includes(alias) || f.includes(v);
}

function trackerHref(params: { category?: string; country?: string }): string {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.country) search.set("country", params.country);
  const query = search.toString();
  return query ? `/project-tracker?${query}` : "/project-tracker";
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
    if (needle) return project.title.toLowerCase().includes(needle) || project.location.toLowerCase().includes(needle);
    return true;
  });
  const filteredTerritories = territories.filter((row) => {
    if (country && !matchesCountry(row.country, country)) return false;
    if (needle) return row.country.toLowerCase().includes(needle) || row.sector.toLowerCase().includes(needle);
    return true;
  });
  const maxProjects = Math.max(1, ...territories.map((t) => t.projects));

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Weekly · updated Sunday"
        title="Project tracker"
        description="Regional projects that drive industrial gas demand, and where ATC is involved"
        actions={
          <FilterChips
            chips={[
              { label: "All", href: trackerHref({ country }), active: !category },
              ...CATEGORY_TABS.map((tab) => ({
                label: tab.label,
                href: trackerHref({ category: tab.value, country }),
                active: category === tab.value,
              })),
            ]}
          />
        }
      />

      <FilterChips
        label="Country"
        chips={[
          { label: "All", href: trackerHref({ category }), active: !country },
          ...COUNTRIES.map((c) => ({ label: c, href: trackerHref({ category, country: c }), active: country === c })),
        ]}
      />

      <KpiBand items={kpis} />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredProjects.length === 0 && (
          <p className="lg:col-span-2 glass-card rounded-xl p-8 text-center text-sm text-ink-muted">
            No projects match {country ? `country: ${country}` : q ? `"${q}"` : "this filter"}.{" "}
            <Link href="/project-tracker">Clear filters</Link>
          </p>
        )}
        {filteredProjects.map((project) => (
          <article
            key={project.title}
            className={`glass-card rounded-xl p-6 flex flex-col gap-4 ${project.statusTone === "danger" ? "border-danger/40" : ""}`}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-[19px] font-bold text-ink">{project.title}</span>
                <span className="text-[13px] text-ink-muted capitalize">
                  {project.location} · {project.category}
                </span>
              </div>
              <span className={`font-mono text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap ${STATUS_CHIP[project.statusTone]}`}>
                {project.status}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-lg bg-panel-high p-3 flex flex-col">
                <span className="eyebrow text-[10px]">Gas demand</span>
                <span className="text-[17px] font-bold text-ink">{project.gasDemand}</span>
              </div>
              <div className="rounded-lg bg-panel-high p-3 flex flex-col">
                <span className="eyebrow text-[10px]">Innovation</span>
                <span className="text-[17px] font-bold text-ink">{project.innovation}</span>
              </div>
              <div className={`rounded-lg p-3 flex flex-col ${project.atcConnection ? "bg-accent/15" : "bg-panel-high"}`}>
                <span className={`eyebrow text-[10px] ${project.atcConnection ? "text-accent" : ""}`}>ATC</span>
                <span className={`text-[17px] font-bold ${project.atcConnection ? "text-accent" : "text-ink-muted"}`}>
                  {project.atcConnection ? "Connected" : "Not linked"}
                </span>
              </div>
            </div>
            <p className="m-0 text-sm text-ink-muted">
              <span className="text-ink-faint">Latest:</span> {project.quote}
            </p>
          </article>
        ))}
      </section>

      <Panel title="Territories">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {["Country", "Projects", "Innovation", "Lead sector", "Opportunity", "Trend"].map((h) => (
                  <th key={h} className="eyebrow font-normal pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTerritories.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ink-muted">
                    No territory data for {country ?? q}.
                  </td>
                </tr>
              )}
              {filteredTerritories.map((row) => (
                <tr key={row.country} className="border-b border-border last:border-0">
                  <td className="py-3.5 pr-4 font-semibold text-ink">{row.country}</td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono w-7 text-ink">{row.projects}</span>
                      <div className="flex-1 h-2 rounded-full bg-panel-highest">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${(row.projects / maxProjects) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono w-10 text-ink">{row.innovationPct}%</span>
                      <div className="flex-1 h-2 rounded-full bg-panel-highest">
                        <div className="h-2 rounded-full bg-cyan" style={{ width: `${row.innovationPct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-ink-muted">{row.sector}</td>
                  <td className={`py-3.5 pr-4 font-mono text-[12px] font-semibold ${OPPORTUNITY_TEXT[row.opportunity] ?? "text-ink-muted"}`}>
                    {row.opportunity}
                  </td>
                  <td className={`py-3.5 ${TREND[row.trend].className}`}>
                    <span aria-label={TREND[row.trend].label}>{TREND[row.trend].symbol}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
