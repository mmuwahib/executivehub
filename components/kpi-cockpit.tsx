import { KpiItem } from "@/lib/types";

const COLOR_MAP = {
  error: { text: "text-error", bar: "bg-error" },
  primary: { text: "text-primary", bar: "bg-primary" },
  tertiary: { text: "text-tertiary", bar: "bg-tertiary" },
};

function KpiCard({ item }: { item: KpiItem }) {
  const colors = COLOR_MAP[item.color];
  return (
    <div className="bg-surface border border-outline-variant p-4 flex flex-col">
      <span className="text-[12px] font-medium text-on-surface-variant mb-1">
        {item.label}
      </span>
      <span className={`text-[28px] font-normal mb-4 ${colors.text}`}>
        {item.value}
      </span>
      <div className="mt-auto pt-4 border-t border-outline-variant">
        <span className="font-mono text-[11px] text-on-surface-variant">
          {item.footer_text}
        </span>
        <div className="mt-2 w-full bg-surface-container h-1">
          <div
            className={`h-full ${colors.bar}`}
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function KpiCockpit({
  geopolitical,
  industry,
  projects,
}: {
  geopolitical: KpiItem;
  industry: KpiItem;
  projects: KpiItem;
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <KpiCard item={geopolitical} />
      <KpiCard item={industry} />
      <KpiCard item={projects} />
    </section>
  );
}
