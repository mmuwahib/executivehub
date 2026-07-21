import { AlertItem } from "@/lib/types";
import CopyButton from "./copy-button";

const TAG_COLOR_MAP: Record<string, string> = {
  error: "text-error",
  primary: "text-primary",
  tertiary: "text-tertiary",
};

export default function AlertPanel({
  id,
  title,
  items,
  badge,
}: {
  id?: string;
  title: string;
  items: AlertItem[];
  badge?: string;
}) {
  return (
    <section id={id} className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-on-surface">{title}</h3>
        {badge && (
          <span className="bg-error text-white text-[10px] px-3 py-1 font-bold uppercase">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-surface border border-outline-variant p-4 hover:bg-surface-container group"
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${
                  TAG_COLOR_MAP[item.tag_color] ?? "text-on-surface-variant"
                }`}
              >
                {item.tag}
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant">
                {item.time}
              </span>
            </div>
            <h4 className="text-[14px] font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            <p className="text-[13px] text-on-surface-variant leading-relaxed mb-2">
              {item.desc}
            </p>
            <CopyButton url={item.source_url} />
          </div>
        ))}
      </div>
    </section>
  );
}
