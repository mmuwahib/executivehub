import { CompetitorRow } from "@/lib/types";

// Competitor strength by country as a heatmap: one amber scale for rivals
// (darker = stronger), the brand blue for Gulf Cryo's own opening.
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

function Cell({ value, classes }: { value: string; classes: string }) {
  return <span className={`h-11 rounded-md flex items-center px-3 text-[13px] ${classes}`}>{value}</span>;
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-4 text-[12px] text-ink-muted">
        {(["Dominant", "Strong", "Active", "Limited"] as const).map((level) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${STRENGTH_CELL[level].split(" ")[0]}`} />
            {level}
          </span>
        ))}
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
                  value={row[c.key].value}
                  classes={STRENGTH_CELL[row[c.key].value] ?? "bg-panel-high text-ink-muted"}
                />
              ))}
              <Cell
                value={row.gcOpportunity.value}
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
    </div>
  );
}
