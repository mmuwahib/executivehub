"use client";

import { Icon } from "@/lib/icons";

export default function PrintButton({
  label,
  icon = "download",
  className = "flex items-center gap-2 px-4 py-2 border border-border text-ink-muted font-mono text-label-caps hover:bg-panel/40 rounded",
}: {
  label: string;
  icon?: string;
  className?: string;
}) {
  return (
    <button onClick={() => window.print()} className={className}>
      <Icon name={icon} size={18} /> {label}
    </button>
  );
}
