"use client";

import { useState } from "react";
import { ChevronDown, Library } from "lucide-react";
import { SourceItem } from "@/lib/types";
import CopyButton from "./copy-button";

export default function SourceList({
  id,
  sources,
}: {
  id?: string;
  sources: SourceItem[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <section id={id} className="bg-surface border border-outline-variant">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-surface-container"
      >
        <div className="flex items-center gap-2">
          <Library size={16} className="text-on-surface-variant" />
          <span className="text-[14px] font-semibold text-on-surface">
            All Sources ({sources.length})
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="divide-y divide-outline-variant">
          {sources.map((source, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <span className="text-[13px] text-on-surface shrink-0">
                {source.title}
              </span>
              <CopyButton url={source.url} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
