import { LiveIntelItem } from "@/lib/types";

export default function FooterTicker({ items }: { items: LiveIntelItem[] }) {
  const loop = [...items, ...items];
  return (
    <footer className="fixed bottom-0 left-0 lg:left-sidebar right-0 h-10 bg-floor/80 backdrop-blur-md border-t border-border z-30 flex items-center px-4 overflow-hidden">
      <div className="flex items-center gap-2 mr-6 shrink-0">
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
        <span className="font-mono text-label-caps font-bold text-accent uppercase">Live Intel Feed</span>
      </div>
      <div className="flex-1 flex items-center gap-10 overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-10 animate-ticker-slow">
          {loop.map((item, i) => (
            <span key={i} className="font-mono text-ticker-data text-ink-muted flex items-center gap-2">
              <span className="text-[10px] text-ink-faint font-bold">{item.time}</span> {item.title}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
