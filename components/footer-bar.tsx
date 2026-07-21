import { Lightbulb } from "lucide-react";

export default function FooterBar({
  generatedAt,
  strategicAlert,
}: {
  generatedAt: string;
  strategicAlert: string;
}) {
  const updated = new Date(generatedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  });

  return (
    <footer className="bg-surface border-t border-outline-variant p-4 mt-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-stretch md:items-center">
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-2 w-2 rounded-full bg-tertiary" />
          <span className="font-mono text-[11px] text-on-surface-variant uppercase">
            Updated: <span className="text-on-surface font-semibold">{updated}</span>
          </span>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase border-l border-outline-variant pl-2 ml-2">
            Source: AI Research
          </span>
        </div>

        <div className="bg-primary text-white p-4 flex-1 max-w-2xl flex items-start gap-3">
          <Lightbulb size={18} className="shrink-0 mt-0.5" />
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider block mb-1">
              Strategic Alert
            </span>
            <p className="text-[13px] leading-relaxed">{strategicAlert}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
