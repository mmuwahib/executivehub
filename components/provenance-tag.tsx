import { Provenance, PROVENANCE_HELP, PROVENANCE_LABEL } from "@/lib/provenance";

const STYLE: Record<Provenance, string> = {
  sourced: "text-positive",
  estimate: "text-warning",
  sample: "text-ink-faint",
};

const DOT: Record<Provenance, string> = {
  sourced: "bg-current",
  estimate: "bg-current",
  sample: "border border-current",
};

// Small label saying where a figure comes from (see lib/provenance.ts).
export default function ProvenanceTag({ value, className = "" }: { value: Provenance; className?: string }) {
  return (
    <span
      title={PROVENANCE_HELP[value]}
      className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap ${STYLE[value]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[value]}`} aria-hidden="true" />
      {PROVENANCE_LABEL[value]}
    </span>
  );
}

// Key explaining the three labels; shown once at the top of every page.
export function ProvenanceLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-ink-muted" aria-label="How to read this data">
      <span className="eyebrow">Data</span>
      {(["sourced", "estimate", "sample"] as const).map((p) => (
        <span key={p} className="inline-flex items-center gap-2">
          <ProvenanceTag value={p} />
          <span>{PROVENANCE_HELP[p]}</span>
        </span>
      ))}
    </div>
  );
}
