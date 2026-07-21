import { ProjectItem } from "@/lib/types";
import CopyButton from "./copy-button";

const STATUS_STYLES: Record<string, string> = {
  "In Progress": "bg-primary text-white",
  Scheduled: "bg-surface-container text-on-surface-variant border border-outline-variant",
  Completed: "bg-tertiary text-white",
};

export default function ProjectTracker({
  id,
  items,
}: {
  id?: string;
  items: ProjectItem[];
}) {
  return (
    <section id={id} className="space-y-3">
      <h3 className="text-[14px] font-semibold text-on-surface mb-4">
        Regional Project Tracker
      </h3>
      <div className="bg-surface border border-outline-variant divide-y divide-outline-variant">
        {items.map((item, i) => (
          <div key={i} className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {item.country_tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] font-semibold uppercase bg-surface-container-high border border-outline-variant px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                  STATUS_STYLES[item.status] ?? "bg-surface-container text-on-surface-variant"
                }`}
              >
                {item.status}
              </span>
            </div>
            <h4 className="text-[14px] font-semibold text-on-surface mb-1">
              {item.title}
            </h4>
            <p className="text-[13px] text-on-surface-variant leading-relaxed mb-2">
              {item.desc}
            </p>
            <p className="text-[12px] text-on-surface leading-relaxed mb-2">
              <span className="font-bold">ATC:</span> {item.atc_relevance}
            </p>
            <CopyButton url={item.source_url} />
          </div>
        ))}
      </div>
    </section>
  );
}
