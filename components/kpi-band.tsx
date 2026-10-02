import { SourceRef, Tone } from "@/lib/types";
import { TONE_TEXT } from "@/lib/tone";
import { KPI_NOTE } from "@/lib/methodology";
import InsightPopover from "@/components/insight-popover";

export interface KpiBandItem {
  label: string;
  value: string;
  suffix?: string;
  delta: string;
  tone: Tone;
  basis?: string;
  sources?: SourceRef[];
}

const COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

// One bordered strip of headline figures, cells split by hairlines (B+ design).
// Each figure has an info button explaining what it rests on.
export default function KpiBand({ items }: { items: KpiBandItem[] }) {
  return (
    <section
      aria-label="Key figures"
      className={`glass-card rounded-xl grid grid-cols-1 sm:grid-cols-2 ${COLS[items.length] ?? "lg:grid-cols-4"} divide-y sm:divide-y-0 divide-border`}
    >
      {items.map((kpi, i) => (
        <div
          key={kpi.label}
          className={`p-6 flex flex-col gap-2 border-border ${i > 0 ? "lg:border-l" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow">{kpi.label}</span>
            <InsightPopover
              insight={{ heading: `${kpi.label}: ${kpi.value}${kpi.suffix ? ` ${kpi.suffix}` : ""}`, definition: KPI_NOTE, basis: kpi.basis, sources: kpi.sources }}
              label={`How ${kpi.label} is worked out`}
              className="w-6 h-6 rounded-full border border-border-strong text-[11px] font-semibold text-ink-faint flex items-center justify-center hover:text-accent hover:border-accent"
            >
              i
            </InsightPopover>
          </div>
          <span className="text-[40px] font-bold leading-none tracking-tight text-ink break-words">
            {kpi.value}
            {kpi.suffix && <span className="ml-2 text-lg font-medium text-ink-muted">{kpi.suffix}</span>}
          </span>
          <span className={`text-[13px] font-semibold ${kpi.tone === "neutral" ? "text-ink-muted" : TONE_TEXT[kpi.tone]}`}>
            {kpi.delta}
          </span>
        </div>
      ))}
    </section>
  );
}
