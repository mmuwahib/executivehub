import { TickerItem } from "@/lib/types";

const DIRECTION_CLASS: Record<TickerItem["direction"], string> = {
  up: "text-accent",
  down: "text-danger",
  flat: "text-ink-faint",
};

const DIRECTION_ARROW: Record<TickerItem["direction"], string> = {
  up: "▲",
  down: "▼",
  flat: "▬",
};

export default function MarketTicker({ items }: { items: TickerItem[] }) {
  const loop = [...items, ...items];
  return (
    <div className="h-10 border-b border-border bg-floor/60 flex items-center overflow-hidden">
      <div className="flex items-center gap-2 px-4 h-full border-r border-border shrink-0 bg-panel">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        <span className="font-mono text-[11px] tracking-widest text-accent">MARKETS LIVE</span>
      </div>
      <div className="flex items-center gap-10 px-6 whitespace-nowrap animate-ticker">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-ticker-data">
            <span className="text-ink-faint">{item.label}</span>
            <span className="text-ink">{item.value}</span>
            {item.change && (
              <span className={DIRECTION_CLASS[item.direction]}>
                {DIRECTION_ARROW[item.direction]} {item.change}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
