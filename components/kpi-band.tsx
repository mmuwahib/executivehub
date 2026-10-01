import { Tone } from "@/lib/types";
import { TONE_TEXT } from "@/lib/tone";

export interface KpiBandItem {
  label: string;
  value: string;
  suffix?: string;
  delta: string;
  tone: Tone;
}

const COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

// One bordered strip of headline figures, cells split by hairlines (B+ design).
export default function KpiBand({ items }: { items: KpiBandItem[] }) {
  return (
    <section
      aria-label="Key figures"
      className={`glass-card rounded-xl grid grid-cols-1 sm:grid-cols-2 ${COLS[items.length] ?? "lg:grid-cols-4"} divide-y sm:divide-y-0 divide-border overflow-hidden`}
    >
      {items.map((kpi, i) => (
        <div
          key={kpi.label}
          className={`p-6 flex flex-col gap-2 border-border ${i > 0 ? "lg:border-l" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`}
        >
          <span className="eyebrow">{kpi.label}</span>
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
