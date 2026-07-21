import { AlertTriangle, Handshake, Route, Info } from "lucide-react";
import { AlertItem, MilestoneItem } from "@/lib/types";
import CopyButton from "./copy-button";

const ICON_MAP: Record<string, typeof Info> = {
  warning: AlertTriangle,
  handshake: Handshake,
  route: Route,
};

const TAG_COLOR_MAP: Record<string, string> = {
  error: "text-error",
  primary: "text-primary",
  tertiary: "text-tertiary",
};

const ICON_COLOR_MAP: Record<string, string> = {
  error: "border-error text-error",
  primary: "border-primary text-primary",
  tertiary: "border-tertiary text-tertiary",
};

export default function BusinessPanel({
  businessId,
  gulfcryoId,
  business,
  gulfcryo,
}: {
  businessId?: string;
  gulfcryoId?: string;
  business: AlertItem[];
  gulfcryo: MilestoneItem[];
}) {
  return (
    <div className="space-y-6">
      <section id={businessId} className="space-y-3">
        <h3 className="text-[14px] font-semibold text-on-surface mb-4">
          Business &amp; Regulatory
        </h3>
        <div className="space-y-0.5">
          {business.map((item, i) => (
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

      <section id={gulfcryoId} className="space-y-3">
        <h3 className="text-[14px] font-semibold text-on-surface mb-4">
          GulfCryo Watch
        </h3>
        <div className="bg-surface border border-outline-variant divide-y divide-outline-variant">
          {gulfcryo.map((item, i) => {
            const Icon = ICON_MAP[item.icon] ?? Info;
            return (
            <div key={i} className="p-4 flex gap-4">
              <div className="shrink-0">
                <div
                  className={`w-8 h-8 border flex items-center justify-center ${
                    ICON_COLOR_MAP[item.icon_color] ??
                    "border-outline-variant text-on-surface-variant"
                  }`}
                >
                  <Icon size={16} />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-[14px] font-semibold text-on-surface mb-1">
                  {item.title}
                </h5>
                <p className="text-[12px] text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
