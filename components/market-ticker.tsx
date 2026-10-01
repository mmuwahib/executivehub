import { TickerItem } from "@/lib/types";

const DIRECTION_CLASS: Record<TickerItem["direction"], string> = {
  up: "text-positive",
  down: "text-danger",
  flat: "text-ink-faint",
};

const DIRECTION_ARROW: Record<TickerItem["direction"], string> = {
  up: "▲",
  down: "▼",
  flat: "—",
};

// Markets strip under the header. `live` is false until a market data
// provider is connected, in which case the values are labelled as samples.
export default function MarketTicker({ items, live }: { items: TickerItem[]; live: boolean }) {
  const loop = [...items, ...items];
  return (
    <div className="h-10 bg-surface-low border-b border-border overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 md:px-10 h-full flex items-center gap-6">
        <span className="eyebrow shrink-0">
          Markets{!live && <span className="ml-2 text-warning">Sample</span>}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-10 whitespace-nowrap animate-ticker-slow w-max">
            {loop.map((item, i) => (
              <span key={i} className="flex items-center gap-2 font-mono text-[12px]">
                <span className="text-ink-faint">{item.label}</span>
                <span className="text-ink font-semibold">{item.value}</span>
                {item.change && (
                  <span className={DIRECTION_CLASS[item.direction]}>
                    {DIRECTION_ARROW[item.direction]} {item.change}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
