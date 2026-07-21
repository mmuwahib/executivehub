import { formatHeaderDate } from "@/lib/utils";

export default function Topbar() {
  return (
    <header className="h-12 shrink-0 bg-surface border-b border-outline-variant flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-[18px] font-bold text-on-surface tracking-tight">ATC</span>
        <span className="text-[18px] font-light text-on-surface-variant tracking-tight">
          Intelligence
        </span>
      </div>
      <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
        {formatHeaderDate()}
      </span>
    </header>
  );
}
