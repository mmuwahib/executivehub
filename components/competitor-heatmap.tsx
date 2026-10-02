import { CompetitorCell, CompetitorRow } from "@/lib/types";
import { COMPETITOR_STRENGTH, GC_OPENING } from "@/lib/methodology";
import InsightPopover from "@/components/insight-popover";

// Competitor strength by country as a heatmap: one amber scale for rivals
// (darker = stronger), the brand blue for Gulf Cryo's own opening. Every cell
// opens a popover with what the rating means, why it was given, and sources.
const STRENGTH_CELL: Record<string, string> = {
  Dominant: "bg-warning text-floor font-bold",
  Strong: "bg-warning/50 text-ink font-semibold",
  Active: "bg-warning/20 text-ink",
  Limited: "bg-panel-highest text-ink-faint",
};

const OPENING_CELL: Record<string, string> = {
  High: "bg-accent text-accent-on font-bold",
  Moderate: "bg-accent/25 text-ink font-semibold",
  Contested: "border border-border-strong text-ink-muted",
};

const COMPETITORS: { key: "linde" | "airProducts" | "airLiquide" | "messer"; label: string }[] = [
  { key: "linde", label: "Linde" },
  { key: "airProducts", label: "Air Products" },
  { key: "airLiquide", label: "Air Liquide" },
  { key: "messer", label: "Messer" },
];

const CELL_BASE =
  "h-11 w-full rounded-md flex items-center justify-between gap-2 px-3 text-[13px] transition hover:ring-2 hover:ring-accent/60";

function Cell({ cell, heading, definition, classes }: { cell: CompetitorCell; heading: string; definition?: string; classes: string }) {
  return (
    <InsightPopover
      insight={{ heading, definition, basis: cell.basis, sources: cell.sources }}
      label={`${heading}. Show why.`}
      className={`${CELL_BASE} ${classes}`}
    >
      <span>{cell.value}</span>
      {cell.basis && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" aria-hidden="true" />}
    </InsightPopover>
  );
}

// A one-line summary computed from the table itself (no extra claims).
function readOut(rows: CompetitorRow[]): string | null {
  const open = rows.filter((r) => r.gcOpportunity.value === "High").map((r) => r.country);
  const contested = rows.filter((r) => r.gcOpportunity.value === "Contested").map((r) => r.country);
  const parts: string[] = [];
  if (open.length) parts.push(`Clearest opening: ${open.join(", ")}.`);
  if (contested.length) parts.push(`Contested by a dominant or strong player: ${contested.join(", ")}.`);
  return parts.length ? parts.join(" ") : null;
}

export default function CompetitorHeatmap({ rows, showReadOut = true }: { rows: CompetitorRow[]; showReadOut?: boolean }) {
  const summary = showReadOut ? readOut(rows) : null;
  const explained = rows.some((r) => r.gcOpportunity.basis || COMPETITORS.some((c) => r[c.key].basis));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-[12px] text-ink-muted">
          {(["Dominant", "Strong", "Active", "Limited"] as const).map((level) => (
            <InsightPopover
              key={level}
              insight={{ heading: `${level}`, definition: COMPETITOR_STRENGTH[level], basis: "Rating level used for every competitor cell." }}
              className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 hover:bg-panel-high"
            >
              <span className={`w-3 h-3 rounded-sm ${STRENGTH_CELL[level].split(" ")[0]}`} />
              {level}
            </InsightPopover>
          ))}
        </div>
        <span className="text-[12px] text-ink-faint">
          {explained ? "Hover or tap a cell to see why it was rated that way" : "Hover or tap a cell to see what the rating means"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-[140px_repeat(5,minmax(96px,1fr))] gap-1.5 min-w-[620px]">
          <span />
          {COMPETITORS.map((c) => (
            <span key={c.key} className="eyebrow px-1">
              {c.label}
            </span>
          ))}
          <span className="eyebrow px-1 text-accent">GC opening</span>

          {rows.map((row) => (
            <div key={row.country} className="contents">
              <span className="font-semibold text-sm flex items-center">{row.country}</span>
              {COMPETITORS.map((c) => (
                <Cell
                  key={c.key}
                  cell={row[c.key]}
                  heading={`${c.label} in ${row.country}: ${row[c.key].value}`}
                  definition={COMPETITOR_STRENGTH[row[c.key].value]}
                  classes={STRENGTH_CELL[row[c.key].value] ?? "bg-panel-high text-ink-muted"}
                />
              ))}
              <Cell
                cell={row.gcOpportunity}
                heading={`Gulf Cryo opening in ${row.country}: ${row.gcOpportunity.value}`}
                definition={GC_OPENING[row.gcOpportunity.value]}
                classes={OPENING_CELL[row.gcOpportunity.value] ?? "bg-panel-high text-ink-muted"}
              />
            </div>
          ))}
        </div>
      </div>

      {summary && (
        <p className="m-0 px-4 py-3 rounded-lg bg-panel-high text-sm text-ink-muted">
          <span className="font-semibold text-ink">Read-out:</span> {summary}
        </p>
      )}

      <details className="group rounded-lg border border-border px-4 py-3 text-sm">
        <summary className="cursor-pointer font-semibold text-ink list-none flex items-center gap-2">
          <span className="transition-transform group-open:rotate-90" aria-hidden="true">›</span>
          How ratings are decided
        </summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[13px] text-ink-muted">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">Competitor strength</span>
            {Object.entries(COMPETITOR_STRENGTH).map(([level, text]) => (
              <p key={level} className="m-0">
                <span className="font-semibold text-ink">{level}:</span> {text}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <span className="eyebrow">Gulf Cryo opening</span>
            {Object.entries(GC_OPENING).map(([level, text]) => (
              <p key={level} className="m-0">
                <span className="font-semibold text-ink">{level}:</span> {text}
              </p>
            ))}
            <p className="m-0 text-ink-faint">
              Ratings come from the weekly refresh: Claude searches recent news on approved outlets, applies this scale, and
              records the evidence and articles behind each cell.
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
