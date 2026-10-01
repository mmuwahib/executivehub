import { LiveIntelItem } from "@/lib/types";

export default function FooterTicker({ items, live }: { items: LiveIntelItem[]; live: boolean }) {
  const loop = [...items, ...items];
  return (
    <footer className="fixed bottom-0 inset-x-0 h-10 bg-floor border-t border-border z-30 overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 md:px-10 h-full flex items-center gap-6">
        <span
          className={`flex items-center gap-2 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${
            live ? "text-positive" : "text-warning"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-positive" : "bg-warning"}`} />
          {live ? "Live Intel Feed" : "Sample Feed"}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-10 whitespace-nowrap animate-ticker-slow w-max">
            {loop.map((item, i) => (
              <span key={i} className="font-mono text-[12px] text-ink-muted flex items-center gap-2">
                <span className="text-ink-faint">{item.time}</span> {item.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
